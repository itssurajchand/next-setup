const findEmptyVal = (args: Record<any, any>, valuesToIgnore: any[] = []) => {
  let emptyVarName = null
  let emptyVarValue = null

  Object.keys(args).find(currKey => {
    if (!!!args[currKey] && !valuesToIgnore.includes(args[currKey])) {
      emptyVarName = currKey
      emptyVarValue = args[currKey]
      return true
    }
    return false
  })

  return {
    emptyVarName,
    emptyVarValue
  }
}

const objectToUrlParams = (obj: Record<string, any>) => {
  const params: string[] = []
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && ![null, undefined].includes(obj[key])) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    }
  }
  return params.join('&')
}

function swapKeysAndValues(obj: Record<any, any>) {
  const swappedObj: typeof obj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      swappedObj[obj[key]] = key
    }
  }
  return swappedObj
}

/**
/**
 * Convert JSON object to FormData
 * @param json JSON object to convert
 * @returns FormData object
 */
function objectToFormData(json: Record<string, any>): FormData {
  const formData = new FormData()

  function appendFormData(data: any, rootName: string | null = null) {
    if (Array.isArray(data)) {
      data.forEach((value, index) => {
        appendFormData(value, `${rootName}[${index}]`)
      })
    } else if (typeof data === 'object' && data !== null && !(data instanceof File) && !(data instanceof Date)) {
      Object.keys(data).forEach(key => {
        if (rootName) {
          appendFormData(data[key], `${rootName}.${key}`)
        } else {
          appendFormData(data[key], key)
        }
      })
    } else {
      if (data instanceof File) {
        formData.append(rootName!, data, data.name)
      } else if (data instanceof Date) {
        formData.append(rootName!, data.toISOString())
      } else if (data !== undefined) {
        formData.append(rootName!, data)
      }
    }
  }

  appendFormData(json)

  return formData
}

const object = {
  objectToFormData,
  findEmptyVal,
  swapKeysAndValues,
  objectToUrlParams
}

export { object }
