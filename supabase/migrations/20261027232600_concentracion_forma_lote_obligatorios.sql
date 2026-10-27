alter table public.medicamentos
  alter column concentracion set not null,
  alter column forma_farmaceutica set not null,
  alter column lote set not null;
