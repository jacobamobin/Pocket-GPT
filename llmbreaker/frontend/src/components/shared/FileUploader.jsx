import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { FiUpload } from 'react-icons/fi'
import InfoIcon from './InfoIcon'

export default function FileUploader({ onFile, disabled }) {
  const onDrop = useCallback(accepted => {
    if (accepted.length > 0) onFile(accepted[0])
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    disabled,
  })

  return (
    <div className="relative">
      <div className="absolute -top-1 -right-1 z-10">
        <InfoIcon topicId="file-uploader" />
      </div>
      <motion.div
        {...getRootProps()}
        whileHover={disabled ? {} : { borderColor: '#a78b71' }}
        className={`
          flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-dashed border text-sm
          transition-colors cursor-pointer select-none
          ${isDragActive
            ? 'border-gold-base bg-gold-subtle text-gold-light'
            : 'border-white/20 bg-neural-surface text-gold-base hover:text-white'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <FiUpload className="w-4 h-4" />
        {isDragActive ? 'Drop it here' : 'Upload .txt / .docx'}
      </motion.div>
    </div>
  )
}
