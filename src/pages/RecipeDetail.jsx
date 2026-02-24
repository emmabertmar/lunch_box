import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function RecipeDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    fetchRecipe()
    incrementViews()
  }, [id])

  async function fetchRecipe() {
    const { data, error } = await supabase
      .from('recipes')
      .select(`*, profiles(username), likes(id, user_id)`)
      .eq('id', id)
      .single()

    if (error || !data) { navigate('/'); return }

    setRecipe(data)
    setLikeCount(data.likes?.length ?? 0)
    setLiked(data.likes?.some(like => like.user_id === user?.id))
    setLoading(false)
  }

  async function incrementViews() {
    await supabase.rpc('increment_views', { recipe_id: id })
  }

  async function handleLike() {
    if (likeLoading) return
    setLikeLoading(true)
    if (liked) {
      await supabase.from('likes').delete().eq('recipe_id', id).eq('user_id', user.id)
      setLiked(false)
      setLikeCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ recipe_id: id, user_id: user.id })
      setLiked(true)
      setLikeCount(c => c + 1)
    }
    setLikeLoading(false)
  }

  // Split text by newlines or commas into a clean list
  function toLines(text) {
    return text.split(/\n|,/).map(s => s.trim()).filter(Boolean)
  }

  if (loading) return <div className="feed-message">Loading...</div>

  const ingredients = toLines(recipe.ingredients)
  const instructions = toLines(recipe.instructions)

  return (
    <div className="detail-container">
      <button className="btn-back" onClick={() => navigate('/')}>← Back to feed</button>

      {recipe.photo_url && (
        <img src={recipe.photo_url} alt={recipe.title} className="detail-photo" />
      )}

      <div className="detail-body">
        <p className="card-username">@{recipe.profiles?.username}</p>
        <h1 className="detail-title">{recipe.title}</h1>

        {recipe.description && (
          <p className="detail-description">{recipe.description}</p>
        )}

        <div className="detail-stats">
          <button
            className={`btn-like ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={likeLoading}
          >
            ♥ {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </button>
          <span className="card-views">{recipe.views} views</span>
        </div>

        <div className="detail-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <h2>Instructions</h2>
          <ol className="instructions-list">
            {instructions.map((step, i) => (
              <li key={i}>
                <span className="step-number">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
