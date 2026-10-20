import { createClient } from 'npm:@supabase/supabase-js@2';

const MENSAJE_ERROR_GENERAL = 'No pudimos completar la acción. Intentá de nuevo en unos minutos.';
const MENSAJE_ERROR_LISTAR = 'No pudimos cargar las cuentas. Intentá de nuevo en unos minutos.';
const ACCIONES = {
  listar: true,
  suspender: true,
  rehabilitar: true,
  promover: true,
  revocar: true,
};

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

function textoOVacio(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }
  return String(valor);
}

async function listarUsuariosAuth(supabase) {
  const usuarios = [];
  let pagina = 1;
  const porPagina = 200;

  while (pagina <= 50) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: pagina,
      perPage: porPagina,
    });

    if (error) {
      return { usuarios: [], error: error };
    }

    let paginaUsuarios = [];
    if (data && data.users) {
      paginaUsuarios = data.users;
    }

    for (const usuario of paginaUsuarios) {
      usuarios.push(usuario);
    }

    if (paginaUsuarios.length < porPagina) {
      return { usuarios: usuarios, error: null };
    }

    pagina = pagina + 1;
  }

  return { usuarios: usuarios, error: null };
}

async function listarCuentas(supabase) {
  const { usuarios: usuariosAuth, error: errorAuth } = await listarUsuariosAuth(supabase);
  if (errorAuth) {
    console.error(errorAuth);
    return responder({ error: MENSAJE_ERROR_LISTAR }, 500);
  }

  const { data: perfiles, error: errorPerfiles } = await supabase
    .from('profiles')
    .select('id, name, dni, rol, is_validado');

  if (errorPerfiles) {
    console.error(errorPerfiles);
    return responder({ error: MENSAJE_ERROR_LISTAR }, 500);
  }

  const emails = {};
  for (const usuarioAuth of usuariosAuth) {
    emails[usuarioAuth.id] = textoOVacio(usuarioAuth.email);
  }

  const usuarios = [];
  for (const perfil of perfiles) {
    usuarios.push({
      id: perfil.id,
      name: textoOVacio(perfil.name),
      email: textoOVacio(emails[perfil.id]),
      dni: textoOVacio(perfil.dni),
      rol: perfil.rol,
      is_validado: perfil.is_validado === true,
    });
  }

  usuarios.sort(function (a, b) {
    return a.name.localeCompare(b.name, 'es');
  });

  return responder({ usuarios: usuarios }, 200);
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
    return responder({ error: 'Tenés que iniciar sesión para gestionar usuarios.' }, 401);
  }

  const { data: datosUsuario, error: errorUsuario } = await supabase.auth.getUser(token);
  if (errorUsuario || !datosUsuario.user) {
    console.error(errorUsuario);
    return responder({ error: 'Tenés que iniciar sesión para gestionar usuarios.' }, 401);
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

  const accion = textoOVacio(datos.accion).trim();
  if (!ACCIONES[accion]) {
    return responder({ error: 'Esa acción no es válida.' }, 400);
  }

  if (accion === 'listar') {
    return listarCuentas(supabase);
  }

  const usuarioId = textoOVacio(datos.usuario_id).trim();
  if (usuarioId === '') {
    return responder({ error: 'Indicá la cuenta que querés modificar.' }, 400);
  }

  if (usuarioId === usuario.id) {
    return responder({ error: 'No podés modificar tu propia cuenta.' }, 403);
  }

  const { data: perfilObjetivo, error: errorObjetivo } = await supabase
    .from('profiles')
    .select('id, rol, is_validado')
    .eq('id', usuarioId)
    .maybeSingle();

  if (errorObjetivo) {
    console.error(errorObjetivo);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  if (perfilObjetivo === null) {
    return responder({ error: 'No encontramos esa cuenta.' }, 404);
  }

  let cambios = {};

  if (accion === 'suspender') {
    if (perfilObjetivo.is_validado === false) {
      return responder({ error: 'Esa cuenta ya está suspendida.' }, 409);
    }
    cambios = { is_validado: false };
  } else if (accion === 'rehabilitar') {
    if (perfilObjetivo.is_validado === true) {
      return responder({ error: 'Esa cuenta ya está activa.' }, 409);
    }
    cambios = { is_validado: true };
  } else if (accion === 'promover') {
    if (perfilObjetivo.rol === 'admin') {
      return responder({ error: 'Esa cuenta ya es administradora.' }, 409);
    }
    cambios = { rol: 'admin' };
  } else if (accion === 'revocar') {
    if (perfilObjetivo.rol !== 'admin') {
      return responder({ error: 'Esa cuenta ya es de usuario.' }, 409);
    }

    const { data: admins, error: errorAdmins } = await supabase
      .from('profiles')
      .select('id')
      .eq('rol', 'admin');

    if (errorAdmins) {
      console.error(errorAdmins);
      return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
    }

    if (admins.length <= 1) {
      return responder({ error: 'Tiene que quedar al menos un administrador.' }, 409);
    }

    cambios = { rol: 'user' };
  }

  const { error: errorUpdate } = await supabase
    .from('profiles')
    .update(cambios)
    .eq('id', usuarioId);

  if (errorUpdate) {
    console.error(errorUpdate);
    return responder({ error: MENSAJE_ERROR_GENERAL }, 500);
  }

  return responder({ ok: true }, 200);
});
