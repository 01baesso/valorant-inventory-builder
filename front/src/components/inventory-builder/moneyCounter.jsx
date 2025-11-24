import '../../styles/inventory/inventoryMain.css';
import '../../styles/inventory/loadout.css';

export default function MoneyCounter({userInventoryItems = [], removeFromInventory, totalVP, totalBRL}) {
  
	return (
		<div className="money-counter">
      <div className="money-per-skin-api">
        <h4 className="inventory-title">Meu Inventário</h4>
        {userInventoryItems.length === 0 ? (
          <div className="empty-state">Nenhuma skin adicionada</div>
        ) : (
          userInventoryItems.map(item => (
            <div key={item.skin_id} className="inventory-item-card">
              <div className="item-info">
                <span className="item-name">{item.skin_name}</span>
                <span className="item-price">{item.price} VP</span>
              </div>
              <button className="remove-btn" onClick={() => removeFromInventory(item.skin_id)}>×</button>
            </div>
          ))
        )}
      </div>

      <div className="price-viewers">
        <div className="vp-price">
          <p>Valor em VP</p>
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