import { useCallback, useState } from 'react'
import faunadb, { query as q } from 'faunadb'

import { FaunaSchema, FaunaStatus } from './constants'
import { DataItem } from './types/fauna'

interface CollectionCreateParams {
  name: string
  data?: object
  history_days?: number
  ttl_days?: number
  permission?: object
}

interface DocumentCreateParams {
  name: string
  data?: object
  api_version?: string
  priority?: number
}

type CreateParams = CollectionCreateParams | DocumentCreateParams

function createQuery(
  schema: string,
  client: faunadb.Client,
  params: CreateParams
): null | Promise<DataItem> {
  switch (schema) {
    case FaunaSchema.Collection:
      return client.query(q.CreateCollection(params))
    case FaunaSchema.Database:
      return client.query(q.CreateDatabase(params))
    case FaunaSchema.Document:
    case FaunaSchema.Function:
    case FaunaSchema.Index:
      console.log('schema', schema)
      break
  }

  return null
}

export default function useCreate(client: faunadb.Client): [Function, null | DataItem, string] {
  const [data, setData] = useState<null | DataItem>(null)
  const [status, setStatus] = useState(FaunaStatus.NOT_LOADED)

  const create = useCallback((schema: string, params: object) => {
    const fqlQuery = createQuery(schema, client, params)

    if (fqlQuery) {
      fqlQuery
        .then((res: DataItem) => {
          setStatus(FaunaStatus.LOADING)
          setData(res)
          setStatus(FaunaStatus.LOADED)
        })
        .catch(err => {
          console.error(`[fauna-hooks] ${err}`)
          setStatus(FaunaStatus.ERROR)
        })
    }
  }, [])

  console.log(client)
  return [create, data, status]
}