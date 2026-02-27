import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function SavedRecipes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSaved()
  }, [])

  async function fetchSaved() {
    const { data, error } = await supabase
      .from('saves')
      .select(`
        recipe_id,
        recipes(
          id, title, description, photo_url, week_number, views,
          profiles(username),
          likes(id),
          saves(id)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setRecipes(data.map(s => s.recipes).filter(Boolean))
    setLoading(false)
  }

  async function handleUnsave(e, recipeId) {
    e.stopPropagation()
    await supabase.from('saves').delete().eq('recipe_id', recipeId).eq('user_id', user.id)
    setRecipes(prev => prev.filter(r => r.id !== recipeId))
  }

  if (loading) return <div className="feed-message">Loading...</div>

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Sparade recept</h1>
        <p>Recept du har sparat</p>
      </div>

      {recipes.length === 0 ? (
        <div className="feed-message">Du har inte sparat några recept än.</div>
      ) : (
        <div className="my-recipes-list">
          {recipes.map(recipe => (
            <div key={recipe.id} className="my-recipe-row" onClick={() => navigate(`/recipe/${recipe.id}`)}>
              {recipe.photo_url
                ? <img src={recipe.photo_url} alt={recipe.title} className="my-recipe-photo" />
                : <div className="my-recipe-photo-placeholder">{recipe.title[0]}</div>
              }
              <div className="my-recipe-info">
                <p className="card-username">@{recipe.profiles?.username}</p>
                <h2 className="my-recipe-title">{recipe.title}</h2>
                {recipe.description && <p className="my-recipe-desc">{recipe.description}</p>}
                <p className="card-views">{recipe.likes?.length ?? 0} gillningar · {recipe.saves?.length ?? 0} sparade · {recipe.views} visningar</p>
              </div>
              <div className="my-recipe-actions" onClick={e => e.stopPropagation()}>
                <button className="btn-delete" onClick={(e) => handleUnsave(e, recipe.id)}>Ångra sparad</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
