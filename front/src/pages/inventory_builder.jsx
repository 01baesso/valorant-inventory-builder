import React, { useState, useEffect } from 'react';
import '../styles/inventory_builder.css';

import ClassicIMG from '../../public/images/default_weapons/classic.png';
import FrenzyIMG from '../../public/images/default_weapons/frenzy.png';
import ShortyIMG from '../../public/images/default_weapons/shorty.png';
import GhostIMG from '../../public/images/default_weapons/ghost.png';
import SheriffIMG from '../../public/images/default_weapons/sheriff.png';
import StingerIMG from '../../public/images/default_weapons/stinger.png';
import SpectreIMG from '../../public/images/default_weapons/spectre.png';
import BuckyIMG from '../../public/images/default_weapons/bucky.png';
import JudgeIMG from '../../public/images/default_weapons/judge.png';
import BulldogIMG from '../../public/images/default_weapons/bulldog.png';
import GuardianIMG from '../../public/images/default_weapons/Guardian.png';
import PhantomIMG from '../../public/images/default_weapons/phantom.png';
import VandalIMG from '../../public/images/default_weapons/vandal.png';
import MeleeIMG from '../../public/images/default_weapons/melee.png';
import MarshalIMG from '../../public/images/default_weapons/marshal.png';
import OutlawIMG from '../../public/images/default_weapons/outlaw.png';
import OperatorIMG from '../../public/images/default_weapons/operator.png';
import AresIMG from '../../public/images/default_weapons/ares.png';
import OdinIMG from '../../public/images/default_weapons/odin.png';

const DEFAULT_WEAPON_IMAGES = {
  Classic: ClassicIMG,
  Shorty: ShortyIMG,
  Frenzy: FrenzyIMG,
  Ghost: GhostIMG,
  Sheriff: SheriffIMG,
  Stinger: StingerIMG,
  Spectre: SpectreIMG,
  Bucky: BuckyIMG,
  Judge: JudgeIMG,
  Bulldog: BulldogIMG,
  Guardian: GuardianIMG,
  Phantom: PhantomIMG,
  Vandal: VandalIMG,
  Melee: MeleeIMG,
  Marshal: MarshalIMG,
  Outlaw: OutlawIMG,
  Operator: OperatorIMG,
  Ares: AresIMG,
  Odin: OdinIMG
};

const API_VALORANT_BASE = 'https://vinfo-api.com';
const API_BACK = 'http://localhost:8000/api';

const weaponIdMap = {
  Classic: '29A0CFAB-485B-F5D5-779A-B59F85E204A8',
  Shorty: '42DA8CCC-40D5-AFFC-BEEC-15AA47B42EDA',
  Frenzy: '44D4E95C-4157-0037-81B2-17841BF2E8E3',
  Ghost:  '1BAA85B4-4C70-1284-64BB-6481DFC3BB4E',
  Sheriff:'E336C6B8-418D-9340-D77F-7A9E4CFE0702',

  Stinger:'F7E1B454-4AD4-1063-EC0A-159E56B58941',
  Spectre:'62080D1-4035-2937-7C09-27AA2A5C27A7',

  Bucky:  '910BE174-449B-C412-AB22-D0873436B21B',
  Judge:  'EC845BF4-4F79-DDDA-A3DA-0DB3774B2794',

  Bulldog:'AE3DE142-4D85-2547-DD26-4E90BED35CF7',
  Guardian:'4ADE7FAA-4CF1-8376-95EF-39884480959B',
  Phantom:'EE8E8D15-496B-07AC-E5F6-8FAE5D4C7B1A',
  Vandal:'9C82E19D-4575-0200-1A81-3EACF00CF872',

  Melee:'2F59173C-4BED-B6C3-2191-DEA9B58BE9C7',

  Marshal:'C4883E50-4494-202C-3EC3-6B8A9284F00B',
  Outlaw:'5F0AAF7A-4289-3998-D5FF-EB9A5CF7EF5C',
  Operator:'A03B24D3-4319-996D-0F8C-94BBFBA1DFC7',

  Ares:'55D8A0F4-4274-CA67-FE2C-06AB45EFDF58',
  Odin:'63E6C2B6-4A8E-869C-3D4C-E38355226584'
};

const weaponCategories = {
  pistols:  ['Classic', 'Shorty', 'Frenzy', 'Ghost', 'Sheriff'],
  smgs:     ['Stinger', 'Spectre'],
  shotguns: ['Bucky', 'Judge'],
  rifles:   ['Bulldog', 'Guardian', 'Phantom', 'Vandal'],
  snipers:  ['Marshal', 'Outlaw', 'Operator'],
  heavies:  ['Ares', 'Odin'],
  melee:    ['Melee']
};

const extractPrice = (obj) => {
  if (!obj) return 0;
  if (typeof obj === 'number') return obj;
  if (typeof obj === 'object') {
    const vals = Object.values(obj);
    if (vals.length > 0 && typeof vals[0] === 'number') return vals[0];
    return 0;
  }
  return 0;
};

export default function InventoryBuilder() {
  /* Estados com nomes explicativos */
  const [selectedWeaponId, setSelectedWeaponId] = useState(null);
  const [selectedWeaponName, setSelectedWeaponName] = useState('');
  const [availableSkinsList, setAvailableSkinsList] = useState([]);
  const [userInventoryItems, setUserInventoryItems] = useState([]);
  const [username, setUsername] = useState('');
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [weaponImagesMap, setWeaponImagesMap] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('username');
    if (saved) setUsername(saved);
    else setLoadingInventory(false);
  }, []);

  /* Busca inventário do backend */
  useEffect(() => {
    if (!username) return;
    const fetchInventory = async () => {
      try {
        const res = await fetch(`${API_BACK}/inventory/?username=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setUserInventoryItems(data.inventory || []);
          const mapping = {};
          (data.inventory || []).forEach(it => {
            if (it.weapon_name) mapping[it.weapon_name] = it.image_url;
          });
          setWeaponImagesMap(prev => ({ ...prev, ...mapping }));
        } else {
          console.warn('GET /inventory returned', res.status);
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
      } finally {
        setLoadingInventory(false);
      }
    };
    fetchInventory();
  }, [username]);

  /* fetchSkinsForWeapon: busca e filtra apenas por weaponId (EXATO) */
  const fetchSkinsForWeapon = async (weaponId) => {
    setAvailableSkinsList([]);
    const endpoints = [
      `${API_VALORANT_BASE}/json/weaponSkins`,
      `${API_VALORANT_BASE}/json/weaponSkins2`,
      `${API_VALORANT_BASE}/dashboard/weaponSkins`,
      `${API_VALORANT_BASE}/weaponSkins`
    ];

    let data = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          await res.text();
          continue;
        }
        const json = await res.json();
        data = json;
        break;
      } catch (err) {
        console.warn('Fetch failed for', url, err);
      }
    }

    if (!data) {
      setNotificationMessage('API externa indisponível ou retornou HTML.');
      setTimeout(() => setNotificationMessage(''), 3000);
      return;
    }

    /* Normaliza resposta para array */
    let allSkins = [];
    if (Array.isArray(data)) allSkins = data;
    else if (data?.data && Array.isArray(data.data)) allSkins = data.data;
    else if (data?.items && Array.isArray(data.items)) allSkins = data.items;
    else if (typeof data === 'object') allSkins = Object.values(data);

    /* FILTRO ESTRITO: somente items com item.weaponId === weaponId */
    const filtered = allSkins.filter(item => item && item.weaponId === weaponId);

    /* Mapeia para formato simples e escolhe um ícone de exibição */
    const skins = filtered.map(item => {
      let icon = item.displayIcon || item.image || null;
      if (!icon && Array.isArray(item.levels) && item.levels.length > 0) {
        const lv = item.levels.find(l => l.displayIcon) || item.levels[0];
        icon = lv?.displayIcon || null;
      }
      if (!icon && Array.isArray(item.chromas) && item.chromas.length > 0) {
        const ch = item.chromas.find(c => c.displayIcon) || item.chromas[0];
        icon = ch?.displayIcon || ch?.fullRender || ch?.swatch || null;
      }
      return {
        uuid: item.id || item.uuid || `${item.name}-${Math.random()}`,
        displayName: item.displayName || item.name || 'Skin',
        displayIcon: icon,
        price: extractPrice(item.price) || 0
      };
    }).filter(s => s.displayIcon);

    /* Remove duplicatas por uuid */
    const unique = [];
    const seen = new Set();
    skins.forEach(s => {
      if (!seen.has(s.uuid)) {
        seen.add(s.uuid);
        unique.push(s);
      }
    });

    setAvailableSkinsList(unique);
  };

  /* Seleciona arma (usa o map para pegar o weaponId) */
  const handleWeaponSelection = (weaponName) => {
    const id = weaponIdMap[weaponName];
    if (!id) {
      setNotificationMessage('ID da arma não encontrado para: ' + weaponName);
      setTimeout(() => setNotificationMessage(''), 2500);
      return;
    }
    setSelectedWeaponId(id);
    setSelectedWeaponName(weaponName);
    fetchSkinsForWeapon(id);
  };

  /* Adiciona skin ao inventário (POST) */
  const addToInventory = async (skin) => {
    if (!username) {
      setNotificationMessage('Faça login para salvar skins.');
      setTimeout(() => setNotificationMessage(''), 3000);
      return;
    }
    try {
      const payload = {
        skin_id: skin.uuid,
        skin_name: skin.displayName,
        image_url: skin.displayIcon,
        price: skin.price || 0
      };
      const res = await fetch(`${API_BACK}/inventory/add/?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setUserInventoryItems(data.inventory || []);
        setWeaponImagesMap(prev => ({ ...prev, [selectedWeaponName]: skin.displayIcon }));
        setNotificationMessage(`${skin.displayName} adicionada`);
      } else {
        const err = await res.json().catch(() => ({}));
        setNotificationMessage(`${err.error || 'Falha ao adicionar'}`);
      }
    } catch (err) {
      console.error('Erro ao adicionar inventário:', err);
      setNotificationMessage('✗ Erro de conexão ao salvar');
    } finally {
      setTimeout(() => setNotificationMessage(''), 3500);
    }
  };

  /* Seleciona skin — remove skin anterior da mesma arma (se houver) e adiciona nova */
  const handleSkinSelection = async (skin) => {
    if (!selectedWeaponId) {
      setNotificationMessage('Selecione a arma primeiro.');
      setTimeout(() => setNotificationMessage(''), 2000);
      return;
    }
    if (userInventoryItems.some(i => i.skin_id === skin.uuid)) {
      setNotificationMessage('Você já possui esta skin!');
      setTimeout(() => setNotificationMessage(''), 2500);
      return;
    }

    const currentMappedImage = weaponImagesMap[selectedWeaponName];
    if (currentMappedImage) {
      const oldItem = userInventoryItems.find(it => it.image_url === currentMappedImage);
      if (oldItem) {
        await removeFromInventory(oldItem.skin_id);
      }
    }

    await addToInventory(skin);
  };

  /* Remove item do inventário (DELETE) */
  const removeFromInventory = async (skin_id) => {
    const removedItem = userInventoryItems.find(item => item.skin_id === skin_id);
    try {
      const res = await fetch(`${API_BACK}/inventory/${encodeURIComponent(skin_id)}/?username=${encodeURIComponent(username)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setUserInventoryItems(data.inventory || []);
        if (removedItem && removedItem.image_url) {
          setWeaponImagesMap(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(weapon => {
              if (updated[weapon] === removedItem.image_url) {
                if (DEFAULT_WEAPON_IMAGES[weapon]) updated[weapon] = DEFAULT_WEAPON_IMAGES[weapon];
                else delete updated[weapon];
              }
            });
            return updated;
          });
        }
        setNotificationMessage('✓ Item removido');
      } else {
        console.warn('Falha ao remover item', res.status);
      }
    } catch (err) {
      console.error('Erro ao remover do inventário:', err);
      setNotificationMessage('✗ Erro ao remover');
    } finally {
      setTimeout(() => setNotificationMessage(''), 2500);
    }
  };

  /* Render helpers */
  const totalVP = userInventoryItems.reduce((acc, it) => acc + (it.price || 0), 0);
  const totalBRL = (totalVP * 0.03042608695);

  const renderWeaponButton = (name) => {
    const image = weaponImagesMap[name] || DEFAULT_WEAPON_IMAGES[name] || '';
    return (
      <button
        key={name}
        type="button"
        className={selectedWeaponName === name ? 'active' : ''}
        onClick={() => handleWeaponSelection(name)}
      >
        <p>{name}</p>
        <div className="weapon-img-wrap">
          <img src={image} alt={name} />
        </div>
      </button>
    );
  };

  if (loadingInventory) return <div className="loading-state">Carregando inventário...</div>;

  return (
    <main>
      {notificationMessage && <div className="notification-toast">{notificationMessage}</div>}

      <div className="guns-skins">
        <div className="filter-skins">
          <select defaultValue="Coleção">
            <option value="Coleção">Coleção</option>
          </select>
          <select defaultValue="Maior → Menor">
            <option value="Maior → Menor">Maior → Menor</option>
            <option value="Menor → Maior">Menor → Maior</option>
          </select>
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
    </main>
  );
}
