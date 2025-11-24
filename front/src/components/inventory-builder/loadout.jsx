import '../../styles/inventory/inventoryMain.css';
import '../../styles/inventory/loadout.css';

import {DEFAULT_WEAPON_IMAGES, weaponCategories} from './inventoryUtils.jsx';

export default function Loadout({weaponImagesMap, selectedWeaponName, handleWeaponSelection}) {

	const renderWeaponButton = (name) => {
		const image = weaponImagesMap[name] || DEFAULT_WEAPON_IMAGES[name] || '';
		return (
			<button
				key={name}
				type="button"
				className={selectedWeaponName === name ? 'active' : ''}
				onClick={() => handleWeaponSelection(name)}
			>
				<div className="weapon-img-wrap">
					<img src={image} alt={name} />
				</div>
				<p>{name}</p>
			</button>
		);
	};
  
	return (
		<div className="inventory-loadout">
			<div className="loadout-group">
				<h3>SIDEARMS</h3>
				{weaponCategories.pistols.map(renderWeaponButton)}
			</div>

			<div className="loadout-group">
				<h3>SMGS</h3>
				{weaponCategories.smgs.map(renderWeaponButton)}
				<h3>SHOTGUNS</h3>
				{weaponCategories.shotguns.map(renderWeaponButton)}
			</div>

			<div className="loadout-group">
				<h3>RIFLES</h3>
				{weaponCategories.rifles.map(renderWeaponButton)}
				<h3>MELEE</h3>
				{weaponCategories.melee.map(renderWeaponButton)}
			</div>

			<div className="loadout-group">
				<h3>SNIPER RIFLES</h3>
				{weaponCategories.snipers.map(renderWeaponButton)}
				<h3>MACHINE GUNS</h3>
				{weaponCategories.heavies.map(renderWeaponButton)}
			</div>
		</div>
	);
}