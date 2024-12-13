import { getAPIUrl } from '@services/config/config'
import {
  RequestBody,
  RequestBodyFormWithAuthHeader,
  errorHandling,
  getResponseMetadata,
} from '@services/utils/ts/requests'

export async function getUser(user_id: string) {
  const result = await fetch(
    `${getAPIUrl()}users/user_id/${user_id}`,
    RequestBody('GET', null, null)
  )
  const res = await errorHandling(result)
  return res
}

export async function updateUserAvatar(
  user_uuid: any,
  avatar_file: any,
  access_token: any
) {
  const formData = new FormData()
  formData.append('avatar_file', avatar_file)
  const result: any = await fetch(
    `${getAPIUrl()}users/update_avatar/${user_uuid}`,
    RequestBodyFormWithAuthHeader('PUT', formData, null, access_token)
  )
  const res = await getResponseMetadata(result)
  return res
}
