import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function RecipeCard({ recipe, onLikeToggle }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const alreadyLiked = recipe.likes?.some(like => like.user_id === user?.id)
  const alreadySaved = recipe.saves?.some(save => save.user_id === user?.id)

  const [liked, setLiked] = useState(alreadyLiked)
  const [likeCount, setLikeCount] = useState(recipe.likes?.length ?? 0)
  const [saved, setSaved] = useState(alreadySaved)
  const [saveCount, setSaveCount] = useState(recipe.saves?.length ?? 0)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  async function handleLike(e) {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (loading) return
    setLoading(true)

    if (liked) {
      await supabase.from('likes').delete().eq('recipe_id', recipe.id).eq('user_id', user.id)
      setLiked(false)
      setLikeCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ recipe_id: recipe.id, user_id: user.id })
      setLiked(true)
      setLikeCount(c => c + 1)
    }

    setLoading(false)
  }

  async function handleSave(e) {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (saveLoading) return
    setSaveLoading(true)

    if (saved) {
      await supabase.from('saves').delete().eq('recipe_id', recipe.id).eq('user_id', user.id)
      setSaved(false)
      setSaveCount(c => c - 1)
    } else {
      await supabase.from('saves').insert({ recipe_id: recipe.id, user_id: user.id })
      setSaved(true)
      setSaveCount(c => c + 1)
    }

    setSaveLoading(false)
  }

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      {recipe.photo_url
        ? <img src={recipe.photo_url} alt={recipe.title} className="card-photo" />
        : <div className="card-photo-placeholder">{recipe.title[0]}</div>
      }

      <div className="card-body">
        <p className="card-username">@{recipe.profiles?.username}</p>
        <h2 className="card-title">{recipe.title}</h2>
        {recipe.description && (
          <p className="card-description">{recipe.description}</p>
        )}

        <div className="card-footer">
          <button
            className={`btn-like ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={loading}
          >
            ♥ {likeCount}
          </button>

          <button
            className={`btn-save ${saved ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={saveLoading}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {saveCount}
          </button>

          <span className="card-views">{recipe.views} visningar</span>
        </div>
      </div>
    </div>
  )
}
