import React, { useState, useRef } from 'react'

export default function AudioRecorder({ onAudioRecorded, onCancel }) {
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)

        // TODO: PROMPT C
        // 1. Enviar audioBlob a Whisper API
        // 2. Obtener transcripción
        // 3. Traducir texto
        // 4. Generar audio en idioma del contacto
        // onAudioRecorded({ audioBlob, audioURL, transcript, translations })
      }

      mediaRecorder.start()
      setRecording(true)
      setRecordingTime(0)

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      alert('Error al acceder al micrófono: ' + error.message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
    setRecording(false)
    clearInterval(timerRef.current)
  }

  const handleSend = () => {
    if (audioURL && mediaRecorderRef.current) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      onAudioRecorded({
        audioBlob,
        audioURL,
        duration: recordingTime
      })
    }
  }

  const handleCancel = () => {
    if (recording) {
      stopRecording()
    }
    setAudioURL(null)
    setRecordingTime(0)
    onCancel()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // RECORDING STATE
  if (recording) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px 24px',
          textAlign: 'center',
          maxWidth: '280px',
          width: '100%'
        }}>
          {/* ANIMATED RECORDING INDICATOR */}
          <div style={{
            fontSize: '48px',
            marginBottom: '24px',
            animation: 'pulse 1.5s infinite'
          }}>
            🎤
          </div>

          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Grabando mensaje de voz
          </div>

          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--fill-accent)',
            marginBottom: '24px',
            fontFamily: 'monospace'
          }}>
            {formatTime(recordingTime)}
          </div>

          {/* WAVEFORM INDICATOR (simple) */}
          <div style={{
            display: 'flex',
            gap: '4px',
            justifyContent: 'center',
            marginBottom: '24px',
            height: '24px',
            alignItems: 'center'
          }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: '8px',
                  background: 'var(--fill-accent)',
                  borderRadius: '2px',
                  animation: `wave 0.6s ease-in-out ${i * 0.1}s infinite`,
                  opacity: 0.6 + (i * 0.1)
                }}
              />
            ))}
          </div>

          <div style({
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '24px'
          }}>
            Máximo 60 segundos
          </div>

          {/* BUTTONS */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={stopRecording}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--fill-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✓ Detener
            </button>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✕ Cancelar
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
          }
          @keyframes wave {
            0%, 100% { transform: scaleY(0.5); }
            50% { transform: scaleY(1); }
          }
        `}</style>
      </div>
    )
  }

  // PLAYBACK STATE
  if (audioURL) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px 24px',
          textAlign: 'center',
          maxWidth: '280px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '16px'
          }}>
            Mensaje grabado
          </div>

          {/* AUDIO PLAYER */}
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            <audio
              src={audioURL}
              controls
              style={{
                width: '100%',
                height: '36px'
              }}
            />
          </div>

          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '24px'
          }}>
            Duración: {formatTime(recordingTime)}
          </div>

          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '24px',
            fontStyle: 'italic'
          }}>
            Este mensaje será transcrito automáticamente y traducido al idioma de tu contacto.
          </p>

          {/* BUTTONS */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setAudioURL(null)
                setRecordingTime(0)
                startRecording()
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔄 Reintentar
            </button>
            <button
              onClick={handleSend}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--fill-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ↑ Enviar
            </button>
          </div>

          <button
            onClick={handleCancel}
            style={{
              width: '100%',
              padding: '8px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // IDLE STATE - BUTTON
  return (
    <button
      onClick={startRecording}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--fill-accent)',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '0 4px',
        transition: 'transform 0.2s'
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      title="Grabar mensaje de voz"
    >
      🎤
    </button>
  )
}
