import '../../styles/inventory/inventoryMain.css';
import '../../styles/inventory/searchSkins.css';

export default function SearchSkins({selectedWeaponName, availableSkinsList, handleSkinSelection, searchSkin, setSearchSkin, handleSearchSkin}) {

	return (
			<div className="guns-skins">
			<div className="filter-skins">
				<form onSubmit={handleSearchSkin} className="search-skins-form">
					<input className='input-search-skins' type="text" placeholder="Pesquisar nome da skin..." value={searchSkin} onChange={(e) => setSearchSkin(e.target.value)}/>
					<div className="search-skin-buttons">
						<button className='search-skin-button' type='submit'>Buscar</button>
						<button className="clear-skin-search-button" type='submit'>Limpar</button>
					</div>
				</form>
			</div>

			<div className="skins-api">
				{!selectedWeaponName ? (
					<div className="empty-state">Selecione uma arma ao lado →</div>
				) : (
					availableSkinsList.length === 0 ? (
						<div className="empty-state">Nenhuma skin encontrada</div>
					) : (
						availableSkinsList.map(skin => (
							<div
								key={skin.uuid}
								className="skin-button"
								onClick={() => handleSkinSelection(skin)}
							>
								<img src={skin.displayIcon} alt={skin.displayName} />
								<span>{skin.displayName}</span>
							</div>
						))
					)
				)}
			</div>
		</div>
	);
}