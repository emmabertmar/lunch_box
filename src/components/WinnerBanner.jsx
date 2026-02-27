import { useNavigate } from 'react-router-dom'

export default function WinnerBanner({ winner }) {
  const navigate = useNavigate()
  const recipe = winner.recipes

  return (
    <div className="winner-banner" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <div className="winner-label">Vinnare vecka {winner.week_number}</div>

      <div className="winner-content">
        {recipe.photo_url && (
          <img src={recipe.photo_url} alt={recipe.title} className="winner-photo" />
        )}
        <div className="winner-info">
          <p className="card-username">@{recipe.profiles?.username}</p>
          <h2 className="winner-title">{recipe.title}</h2>
          {recipe.description && (
            <p className="winner-description">{recipe.description}</p>
          )}
          <span className="winner-likes">♥ {recipe.likes?.length ?? 0} gillningar</span>
        </div>
      </div>
    </div>
  )
}
