import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCurrentWeek } from '../utils/weekNumber'

export default function RandomRecipe() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState(null)
  const [message, setMessage] = useState(null)

  async function handleRandom() {
    setLoading(true)
    setMessage(null)

    const { week_number, year } = getCurrentWeek()

    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, description, photo_url, likes(id), profiles(username)')
      .eq('week_number', week_number)
      .eq('year', year)

    if (error || !data || data.length === 0) {
      setMessage('Inga recept den här veckan ännu.')
      setRecipe(null)
      setLoading(false)
      return
    }

    const random = data[Math.floor(Math.random() * data.length)]
    setRecipe(random)
    setLoading(false)
  }

  return (
    <div className="random-container">
      <h1>Slumpa recept</h1>
      <p className="upload-subtitle">Kan du inte bestämma dig? Vi väljer åt dig.</p>

      <button className="btn-primary" onClick={handleRandom} disabled={loading}>
        {loading ? 'Söker...' : recipe ? 'Välj ett annat' : 'Välj ett slumpmässigt recept'}
      </button>

      {message && <p className="feed-message">{message}</p>}

      {recipe && (
        <div className="random-result" onClick={() => navigate(`/recipe/${recipe.id}`)}>
          {recipe.photo_url
            ? <img src={recipe.photo_url} alt={recipe.title} className="random-photo" />
            : <div className="random-photo-placeholder">{recipe.title[0]}</div>
          }
          <div className="random-info">
            <p className="card-username">@{recipe.profiles?.username}</p>
            <h2 className="random-title">{recipe.title}</h2>
            {recipe.description && <p className="random-desc">{recipe.description}</p>}
            <p className="random-hint">Klicka för att se hela receptet</p>
          </div>
        </div>
      )}
    </div>
  )
}
