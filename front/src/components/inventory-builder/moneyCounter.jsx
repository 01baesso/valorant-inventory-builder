import '../../styles/inventory/inventoryMain.css';
import '../../styles/inventory/loadout.css';

import removeIcon from '/images/icons/remove.webp';

export default function MoneyCounter({userInventoryItems = [], removeFromInventory, totalVP, totalBRL}) {
  
	return (
		<div className="money-counter">
      <div className="money-per-skin-api">
        <div className="inventory-title-header">
          <h4 className="inventory-title">Meu Inventário</h4>
        </div>
        <div className="inventory-list">
          {userInventoryItems.length === 0 ? (
            <div className="empty-state">Nenhuma skin adicionada</div>
          ) : (
            userInventoryItems.map(item => (
              <div key={item.skin_id} className="inventory-item-card">
                <div className="item-info">
                  <span className="item-name">{item.skin_name}</span>
                  <span className="item-price">{item.price} VP</span>
                </div>
                <button className="remove-btn" onClick={() => removeFromInventory(item.skin_id)}>
                  <img src={removeIcon} alt="Remove Icon"/>
                </button>
              </div>
            ))
          )}
          </div>
      </div>

      <div className="price-viewers">
        <div className="vp-price">
          <p>Valor em Valorant Points</p>
          <span>{totalVP}</span>
        </div>
        <div className="money-price">
          <p>Valor em R$</p>
          <span>R$ {totalBRL.toFixed(2)}</span>
        </div>
      </div>
    </div>
	);
}