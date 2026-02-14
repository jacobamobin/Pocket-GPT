import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'

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
    <motion.div
      {...getRootProps()}
      whileHover={disabled ? {} : { borderColor: '#3b82f6' }}
      className={`
        flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm
        transition-colors cursor-pointer select-none
        ${isDragActive
          ? 'border-blue-400 bg-blue-500/10 text-blue-300'
          : 'border-neural-border bg-neural-surface text-blue-400 hover:text-white'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      {isDragActive ? 'Drop it here' : 'Upload .txt / .docx'}
    </motion.div>
  )
}
