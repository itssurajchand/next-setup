import { string } from './string'

type splitFileNameAndExtFn = (
  fullFileName: string,
  addDotToExtension?: boolean
) => {
  fileName: string
  extension: string
}

type IFileObjToBase64Fn = (file: File) => Promise<string | ArrayBuffer | null>

/**
 *
 * @param fullFileName Name of the file with or withnot extension
 * @param addDotToExtension If true, returns extension with '.' Dot prefixed
 * @returns Object containing filname and extension
 */
const splitFileNameAndExt: splitFileNameAndExtFn = (fullFileName, addDotToExtension = false) => {
  const valueToReturn: { fileName: string; extension: string } = {
    fileName: fullFileName,
    extension: ''
  }

  let lastStrSegment: any = valueToReturn.fileName?.split('/')
  lastStrSegment = lastStrSegment?.[lastStrSegment?.length - 1] as any
  const tempFileNameSegments = lastStrSegment?.split('.') ?? []

  valueToReturn.fileName = tempFileNameSegments.slice(0, tempFileNameSegments.length - 1).join('-')
  valueToReturn.extension = tempFileNameSegments[tempFileNameSegments.length - 1] ?? ''

  if (addDotToExtension) valueToReturn.extension = '.' + valueToReturn.extension

  return valueToReturn
}

const fileToBuffer = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)
  return buffer
}

const fileObjToBase64: IFileObjToBase64Fn = async file => {
  return await new Promise(resolve => {
    var reader = new FileReader()
    reader.onloadend = function () {
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

const base64ToFile = (dataURI: string) => {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new File([new Blob([ab], { type: mimeString })], `abc.${mimeString.split('/').at(-1)}`, {
    type: mimeString
  })
}

const generateUniqueFileName = (file: File) => {
  const uuid = string.generateUniqueId()
  const { extension } = splitFileNameAndExt(file.name)
  return `${uuid}.${extension}`
}

function isVideoFile(filename: string) {
  const videoExtensions = ['.mp4', '.mkv', '.mov', '.avi', '.flv', '.wmv', '.webm']

  // Extract the file extension
  const fileExtension = filename.slice(filename.lastIndexOf('.')).toLowerCase()

  // Check if the file extension is in the list of video extensions
  return videoExtensions.includes(fileExtension)
}

const file = {
  fileToBuffer,
  generateUniqueFileName,
  splitFileNameAndExt,
  fileObjToBase64,
  base64ToFile,
  isVideoFile
}

export { file }
