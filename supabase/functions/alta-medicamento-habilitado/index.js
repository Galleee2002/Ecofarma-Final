import { createClient } from 'npm:@supabase/supabase-js@2';

const MENSAJE_ERROR_GENERAL = 'No pudimos agregar el medicamento al vademécum. Intentá de nuevo en unos minutos.';

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

function limpiarTexto(valor) {
  if (typeof valor !== 'string') {
    return '';
  }
  return valor.trim();
}

function textoONull(valor) {
  if (valor === '') {
    return null;
  }
  return valor;
}

function textoComparable(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }
  return String(valor).trim();
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
    return responder({ error: 'Tenés que iniciar sesión para dar de alta un medicamento.' }, 401);
  }

  const { data: datosUsuario, error: errorUsuario } = await supabase.auth.getUser(token);
  if (errorUsuario || !datosUsuario.user) {
    console.error(errorUsuario);
    return responder({ error: 'Tenés que iniciar sesión para dar de alta un medicamento.' }, 401);
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

  const principioActivo = limpiarTexto(datos.principio_activo);
  const nombreComercial = textoONull(limpiarTexto(datos.nombre_comercial));
  const concentracion = textoONull(limpiarTexto(datos.concentracion));
  const formaFarmaceutica = textoONull(limpiarTexto(datos.forma_farmaceutica));
  const presentacion = textoONull(limpiarTexto(datos.presentacion));
  const requiereReceta = datos.requiere_receta === true;

  if (principioActivo === '') {
    return responder({ error: 'Indicá el principio activo.' }, 400);
  }

  const { data: coincidencias, error: errorBusqueda } = await supabase
    .from('medicamentos_habilitados')
    .select('id, concentracion, forma_farmaceutica')
    .eq('principio_activo', principioActivo);

  if (errorBusqueda) {
    console.error(errorBusqueda);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  for (const fila of coincidencias) {
    const mismaConcentracion = textoComparable(fila.concentracion) === textoComparable(concentracion);
    const mismaForma = textoComparable(fila.forma_farmaceutica) === textoComparable(formaFarmaceutica);
    if (mismaConcentracion && mismaForma) {
      return responder({
        error: 'Ese medicamento ya está en el vademécum. Usá esa fila al aprobar la donación.',
      }, 409);
    }
  }

  const { data: nuevo, error: errorInsert } = await supabase
    .from('medicamentos_habilitados')
    .insert({
      nombre_comercial: nombreComercial,
      principio_activo: principioActivo,
      concentracion: concentracion,
      forma_farmaceutica: formaFarmaceutica,
      presentacion: presentacion,
      requiere_receta: requiereReceta,
    })
    .select('id')
    .single();

  if (errorInsert) {
    console.error(errorInsert);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  return responder({ id: nuevo.id }, 201);
});
