const select = <Table extends { name: string; }, R extends {}>(
  fields: (t: Table) => R,
  table: Table
) => {
  const s = (Object.entries(fields(table)) as [string, { value: string }][]).map(([name, { value }]) => `${value} as ${name}`)
  return `select ${s.join()} from ${table.name};`
}

const string_field = {
  name: `id`,
  value: `id`,
  toUpperCase: () => {
    return {
      ...string_field,
      value: `upper(${string_field.value})`
    }
  }
}

const table = {
  name: `users`,
  id: string_field
}

console.log(
  select(
    t => ({ user_id: t.id.toUpperCase() }),
    table
  )
)
