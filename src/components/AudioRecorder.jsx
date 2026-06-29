import React, { useState, useRef } from 'react'

export default function AudioRecorder({ onAudioSend, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        onAudioSend(audioBlob)
        audioChunksRef.current = []
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('No se pudo acceder al micrófono')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isRecording) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(220, 38, 38, 0.1)',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1px solid rgba(220, 38, 38, 0.3)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#dc2626',
          animation: 'pulse 1s infinite'
        }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>
          Grabando: {formatTime(recordingTime)}
        </span>
        <button
          onClick={stopRecording}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Enviar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: disabled ? 'rgba(0,0,0,0.2)' : '#0052CC',
        color: 'white',
        border: 'none',
        fontSize: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      title="Grabar audio"
    >
      🎙️
    </button>
  )
}
