import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import NeumorphicCard from '../components/NeumorphicCard'
import NeumorphicInput from '../components/NeumorphicInput'
import NeumorphicButton from '../components/NeumorphicButton'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <NeumorphicCard>
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <div className="space-y-3">
          <NeumorphicInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          <NeumorphicInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <NeumorphicButton onClick={signIn} className="w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </div>
  )
}

