import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function MyRecipes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyRecipes()
  }, [])

  async function fetchMyRecipes() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*, likes(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setRecipes(data)
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Radera det här receptet? Det går inte att ångra.')) return
    await supabase.from('recipes').delete().eq('id', id)
    setRecipes(prev => prev.filter(r => r.id !== id))
  }

  if (loading) return <div className="feed-message">Laddar...</div>

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Mina recept</h1>
        <p>Alla recept du har laddat upp</p>
      </div>

      {recipes.length === 0 ? (
        <div className="feed-message">Du har inte laddat upp några recept än.</div>
      ) : (
        <div className="my-recipes-list">
          {recipes.map(recipe => (
            <div key={recipe.id} className="my-recipe-row" onClick={() => navigate(`/recipe/${recipe.id}`)}>
              {recipe.photo_url
                ? <img src={recipe.photo_url} alt={recipe.title} className="my-recipe-photo" />
                : <div className="my-recipe-photo-placeholder">{recipe.title[0]}</div>
              }
              <div className="my-recipe-info">
                <h2 className="my-recipe-title">{recipe.title}</h2>
                {recipe.description && <p className="my-recipe-desc">{recipe.description}</p>}
                <p className="card-views">Vecka {recipe.week_number} · {recipe.likes?.length ?? 0} gillningar · {recipe.views} visningar</p>
              </div>
              <div className="my-recipe-actions" onClick={e => e.stopPropagation()}>
                <button className="btn-edit" onClick={() => navigate(`/recipe/${recipe.id}/edit`)}>Ändra</button>
                <button className="btn-delete" onClick={() => handleDelete(recipe.id)}>Radera</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
