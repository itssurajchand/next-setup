import EditProfile from '@/@core/components/page-wise/admin/settings/EditProfile'
import React from 'react'
import { getServerMode } from '@core/utils/serverHelpers'
export default function page () {
  const mode = getServerMode()
  return (
    <EditProfile mode={mode}/>
  )
}
