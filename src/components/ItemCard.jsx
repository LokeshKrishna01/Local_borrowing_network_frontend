import { useNavigate } from 'react-router-dom';
import { User, Star } from 'lucide-react';

const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div
      className="item-card fade-in"
      onClick={() => navigate(`/items/${item._id}`)}
      id={`item-card-${item._id}`}
    >
      <div className="item-card-image">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x300/1a1a2e/6c63ff?text=No+Image';
          }}
        />
        <span className={`badge badge-${item.status}`}>
          {item.status}
        </span>
      </div>
      <div className="item-card-body">
        <span className="category">{item.category}</span>
        <h3>{item.title}</h3>
        <p className="description">{item.description}</p>
      </div>
      <div className="item-card-footer">
        <div className="owner">
          <User size={14} />
          {item.owner?.name || 'Unknown'}
        </div>
        {item.owner?.reputationScore !== undefined && (
          <div className="reputation">
            <Star size={14} />
            {item.owner.reputationScore}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
