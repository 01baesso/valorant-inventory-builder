import React, { useState, useEffect } from 'react';
import '../styles/inventory/inventoryMain.css';
import '../styles/inventory/searchSkins.css';
import '../styles/inventory/loadout.css';
import '../styles/inventory/moneyCounter.css';

import SearchSkins from '../components/inventory-builder/searchSkins.jsx';
import Loadout from '../components/inventory-builder/loadout.jsx';
import MoneyCounter from '../components/inventory-builder/moneyCounter.jsx';

import {DEFAULT_WEAPON_IMAGES, weaponIdMap, weaponCategories} from '../components/inventory-builder/inventoryUtils.jsx';

const API_VALORANT_BASE = 'https://vinfo-api.com';
const API_BACK = 'http://localhost:8000/api';

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
  const [searchSkin, setSearchSkin] = useState('');

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

  const handleSearchSkin = (e) => {
    e.preventDefault();
    console.log("ABOBORAS");
  }

  if (loadingInventory) return <div className="loading-state">Carregando inventário...</div>;

  return (
    <main className='inventory-builder'>
      {notificationMessage && <div className="notification-toast">{notificationMessage}</div>}

      <SearchSkins
        selectedWeaponName={selectedWeaponName}
        availableSkinsList={availableSkinsList}
        handleSkinSelection={handleSkinSelection}
        searchSkin={searchSkin}
        setSearchSkin={setSearchSkin}
        handleSearchSubmit={handleSearchSkin}
      />

      <Loadout
        weaponImagesMap={weaponImagesMap}
        selectedWeaponName={selectedWeaponName}
        handleWeaponSelection={handleWeaponSelection}
      />

      <MoneyCounter
        userInventoryItems={userInventoryItems}
        removeFromInventory={removeFromInventory}
        totalVP={totalVP}
        totalBRL={totalBRL}
      />
    </main>
  );
}
