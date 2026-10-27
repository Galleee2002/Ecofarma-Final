import { createClient } from 'npm:@supabase/supabase-js@2';

const MENSAJE_ERROR_GENERAL = 'No pudimos actualizar la donación. Intentá de nuevo en unos minutos.';
const ESTADOS_MODERABLES = ['pendiente_revision', 'disponible', 'rechazado'];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function responder(cuerpo, estado) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: {
      'Access-Control-Allow-Origin': corsHeaders['Access-Control-Allow-Origin'],
      'Access-Control-Allow-Headers': corsHeaders['Access-Control-Allow-Headers'],
      'Access-Control-Allow-Methods': corsHeaders['Access-Control-Allow-Methods'],
      'Content-Type': 'application/json',
    },
  });
}

function obtenerFechaDeHoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function limpiarTexto(valor) {
  if (typeof valor !== 'string') {
    if (valor === null || valor === undefined) {
      return '';
    }
    return String(valor).trim();
  }
  return valor.trim();
}

function textoONull(valor) {
  if (valor === '') {
    return null;
  }
  return valor;
}

function validarDatos(datos) {
  if (
    limpiarTexto(datos.nombre_comercial) === '' ||
    limpiarTexto(datos.principio_activo) === '' ||
    limpiarTexto(datos.concentracion) === '' ||
    limpiarTexto(datos.forma_farmaceutica) === '' ||
    limpiarTexto(datos.lote) === '' ||
    limpiarTexto(datos.fecha_vencimiento) === ''
  ) {
    return 'Completá el nombre comercial, el principio activo, la concentración, la forma farmacéutica, el lote, la cantidad y la fecha de vencimiento.';
  }

  const cantidad = Number(datos.cantidad_disponible);
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return 'La cantidad tiene que ser un número entero mayor o igual a 1.';
  }

  if (limpiarTexto(datos.fecha_vencimiento) <= obtenerFechaDeHoy()) {
    return 'No se pueden donar medicamentos vencidos o que vencen hoy. Revisá la fecha de vencimiento.';
  }

  return '';
}

function armarCampos(datos) {
  return {
    nombre_comercial: limpiarTexto(datos.nombre_comercial),
    principio_activo: limpiarTexto(datos.principio_activo),
    concentracion: limpiarTexto(datos.concentracion),
    forma_farmaceutica: limpiarTexto(datos.forma_farmaceutica),
    cantidad_disponible: Number(datos.cantidad_disponible),
    lote: limpiarTexto(datos.lote),
    fecha_vencimiento: limpiarTexto(datos.fecha_vencimiento),
    descripcion: textoONull(limpiarTexto(datos.descripcion)),
  };
}

Deno.serve(async function (req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return responder({ error: 'Acción no permitida.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const authorization = req.headers.get('Authorization') || '';
  const token = authorization.replace('Bearer ', '');
  if (token === '') {
    return responder({ error: 'Tenés que iniciar sesión para moderar donaciones.' }, 401);
  }

  const { data: datosUsuario, error: errorUsuario } = await supabase.auth.getUser(token);
  if (errorUsuario || !datosUsuario.user) {
    console.error(errorUsuario);
    return responder({ error: 'Tenés que iniciar sesión para moderar donaciones.' }, 401);
  }
  const usuario = datosUsuario.user;

  const { data: perfil, error: errorPerfil } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', usuario.id)
    .single();

  if (errorPerfil) {
    console.error(errorPerfil);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (perfil.rol !== 'admin') {
    return responder({ error: 'Esta acción es solo para administradores.' }, 403);
  }

  let datos;
  try {
    datos = await req.json();
  } catch (errorJson) {
    console.error(errorJson);
    return responder({ error: 'Los datos enviados no son válidos.' }, 400);
  }

  const medicamentoId = limpiarTexto(datos.medicamento_id);
  const accion = limpiarTexto(datos.accion);

  if (medicamentoId === '') {
    return responder({ error: 'No se indicó la donación.' }, 400);
  }

  if (accion !== 'corregir' && accion !== 'aprobar' && accion !== 'rechazar') {
    return responder({ error: 'La acción de moderación no es válida.' }, 400);
  }

  const { data: medicamento, error: errorMedicamento } = await supabase
    .from('medicamentos')
    .select('id, estado')
    .eq('id', medicamentoId)
    .maybeSingle();

  if (errorMedicamento) {
    console.error(errorMedicamento);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (medicamento === null) {
    return responder({ error: 'No encontramos esta donación.' }, 404);
  }

  if (!ESTADOS_MODERABLES.includes(medicamento.estado)) {
    return responder({ error: 'Esta donación ya no se puede moderar.' }, 409);
  }

  let campos = {};

  if (accion === 'rechazar') {
    const motivo = limpiarTexto(datos.motivo_rechazo);
    if (motivo === '') {
      return responder({ error: 'Indicá el motivo del rechazo.' }, 400);
    }
    campos = {
      estado: 'rechazado',
      motivo_rechazo: motivo,
    };
  } else {
    const errorValidacion = validarDatos(datos);
    if (errorValidacion !== '') {
      return responder({ error: errorValidacion }, 400);
    }

    campos = armarCampos(datos);

    if (accion === 'aprobar') {
      const medicamentoHabilitadoId = Number(datos.medicamento_habilitado_id);
      if (!Number.isInteger(medicamentoHabilitadoId) || medicamentoHabilitadoId < 1) {
        return responder({ error: 'Elegí un medicamento del vademécum para aprobar la donación.' }, 400);
      }

      const { data: filaVademecum, error: errorVademecum } = await supabase
        .from('medicamentos_habilitados')
        .select('id')
        .eq('id', medicamentoHabilitadoId)
        .maybeSingle();

      if (errorVademecum) {
        console.error(errorVademecum);
        return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
      }

      if (filaVademecum === null) {
        return responder({ error: 'No encontramos ese medicamento en el vademécum.' }, 400);
      }

      campos.estado = 'disponible';
      campos.medicamento_habilitado_id = medicamentoHabilitadoId;
      campos.motivo_rechazo = null;
    }
  }

  const { data: actualizado, error: errorUpdate } = await supabase
    .from('medicamentos')
    .update(campos)
    .eq('id', medicamentoId)
    .in('estado', ESTADOS_MODERABLES)
    .select('id, estado')
    .maybeSingle();

  if (errorUpdate) {
    console.error(errorUpdate);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (actualizado === null) {
    return responder({ error: 'Esta donación ya no se puede moderar.' }, 409);
  }

  return responder({ id: actualizado.id, estado: actualizado.estado }, 200);
});
