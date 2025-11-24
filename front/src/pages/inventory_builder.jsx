import React, { useState, useEffect } from 'react';
import '../styles/inventory_builder.css';

import ClassicIMG from '../assets/default_weapons/classic.png';
import ShortyIMG from '../assets/default_weapons/shorty.png';
import FrenzyIMG from '../assets/default_weapons/frenzy.png';
import GhostIMG from '../assets/default_weapons/ghost.png';
import SheriffIMG from '../assets/default_weapons/sheriff.png';
import StingerIMG from '../assets/default_weapons/stinger.png';
import SpectreIMG from '../assets/default_weapons/spectre.png';
import BuckyIMG from '../assets/default_weapons/bucky.png';
import JudgeIMG from '../assets/default_weapons/judge.png';
import BulldogIMG from '../assets/default_weapons/bulldog.png';
import GuardianIMG from '../assets/default_weapons/Guardian.png';
import PhantomIMG from '../assets/default_weapons/phantom.png';
import VandalIMG from '../assets/default_weapons/vandal.png';
import MeleeIMG from '../assets/default_weapons/melee.png';
import MarhsalIMG from '../assets/default_weapons/marshal.png';
import OutlawIMG from '../assets/default_weapons/outlaw.png';
import OperatorIMG from '../assets/default_weapons/operator.png';
import AresIMG from '../assets/default_weapons/ares.png';
import OdinIMG from '../assets/default_weapons/odin.png';

const DEFAULT_WEAPON_IMG = {
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
  Marshal: MarhsalIMG,
  Outlaw: OutlawIMG,
  Operator: OperatorIMG,
  Ares: AresIMG,
  Odin: OdinIMG
};

// Base URLs
const API_VALORANT_BASE = 'https://vinfo-api.com';
const API_BACK = 'http://localhost:8000/api';

const weaponCategories = {
  pistols:  ['Classic', 'Shorty', 'Frenzy', 'Ghost', 'Sheriff'],
  smgs:     ['Stinger', 'Spectre'],
  shotguns: ['Bucky', 'Judge'],
  rifles:   ['Bulldog', 'Guardian', 'Phantom', 'Vandal'],
  snipers:  ['Marshal', 'Outlaw', 'Operator'],
  heavies:  ['Ares', 'Odin'],
  melee:    ['Melee']
};

const weaponsIdMap = {
  Classic: '29A0CFAB-485B-F5D5-779A-B59F85E204A8',
  Shorty: '42DA8CCC-40D5-AFFC-BEEC-15AA47B42EDA',
  Frenzy: '44D4E95C-4157-0037-81B2-17841BF2E8E3', 
  Ghost: '1BAA85B4-4C70-1284-64BB-6481DFC3BB4E', 
  Sheriff: 'E336C6B8-418D-9340-D77F-7A9E4CFE0702', 
  Stinger: 'F7E1B454-4AD4-1063-EC0A-159E56B58941', 
  Spectre: '62080D1-4035-2937-7C09-27AA2A5C27A7',
  Bucky: '910BE174-449B-C412-AB22-D0873436B21B', 
  Judge: 'EC845BF4-4F79-DDDA-A3DA-0DB3774B2794', 
  Bulldog: 'AE3DE142-4D85-2547-DD26-4E90BED35CF7', 
  Guardian: '4ADE7FAA-4CF1-8376-95EF-39884480959B', 
  Phantom: 'EE8E8D15-496B-07AC-E5F6-8FAE5D4C7B1A', 
  Vandal: '9C82E19D-4575-0200-1A81-3EACF00CF872', 
  Melee: '2F59173C-4BED-B6C3-2191-DEA9B58BE9C7', 
  Marshal: 'C4883E50-4494-202C-3EC3-6B8A9284F00B', 
  Outlaw: '5F0AAF7A-4289-3998-D5FF-EB9A5CF7EF5C', 
  Operator: 'A03B24D3-4319-996D-0F8C-94BBFBA1DFC7', 
  Ares: '55D8A0F4-4274-CA67-FE2C-06AB45EFDF58', 
  Odin: '63E6C2B6-4A8E-869C-3D4C-E38355226584'
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
  const [selectedWeaponId, setSelectedWeaponId] = useState(null);
  const [selectedWeaponName, setSelectedWeaponName] = useState('');
  const [availableSkins, setAvailableSkins] = useState([]);
  const [userInventory, setUserInventory] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [weaponImages, setWeaponImages] = useState({});
  const [searchSkin, setSearchSkin] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('username');
    if (saved) setUsername(saved);
    else setLoading(false);
  }, []);

  // busca inventário do backend
  useEffect(() => {
    if (!username) return;
    const fetchInventory = async () => {
      try {
        const res = await fetch(`${API_BACK}/inventory/?username=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          setUserInventory(data.inventory || []);
          // Preenche weaponImages com correspondência entre arma e image_url, se desejar.
          const mapping = {};
          (data.inventory || []).forEach(it => {
            // Se o item tiver um campo weapon_name, use-o, senão mapeamos só pela imagem
            if (it.weapon_name) mapping[it.weapon_name] = it.image_url;
          });
          setWeaponImages(prev => ({ ...prev, ...mapping }));
        } else {
          console.warn('GET /inventory retornou', res.status);
        }
      } catch (err) {
        console.error('Erro ao buscar inventário do backend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [username]);

  /**
   * fetchSkinsForWeapon
   * - Tenta múltiplos endpoints
   * - Normaliza o retorno (data/items/array/object)
   * - Para melee faz busca por palavras-chave (knife, dagger, blade, axe, mace, hammer)
   * - Retorna apenas o nível base (displayIcon / image) quando possível
   */
  const fetchSkinsForWeapon = async (weaponId) => {
    setAvailableSkins([]);
    const triedEndpoints = [
      `${API_VALORANT_BASE}/json/weaponSkins`,
      `${API_VALORANT_BASE}/json/weaponSkins2`,
      `${API_VALORANT_BASE}/dashboard/weaponSkins`,
      `${API_VALORANT_BASE}/weaponSkins`,
    ];

    let data = null;

    for (const url of triedEndpoints) {
      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) continue;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          // endpoint pode retornar HTML / página; ignora
          await res.text();
          continue;
        }
        const json = await res.json();
        data = json;
        break;
      } catch (err) {
        console.warn('Falha ao fetch em', url, err);
      }
    }

    if (!data) {
      setNotification('✗ API externa indisponível ou retornou HTML.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    // Normaliza para array
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (data?.data && Array.isArray(data.data)) arr = data.data;
    else if (data?.items && Array.isArray(data.items)) arr = data.items;
    else if (typeof data === 'object') arr = Object.values(data);

    const filtered = arr.filter(item => item && item.weaponId === weaponId);

    // Mapeia cada item para *apenas* o nível base (fallback para chroma/level se não houver)
    const skins = filtered.map(item => {
      // tenta primeiro o ícone base
      let icon = item.displayIcon || item.image;
      
      // fallback: first level displayIcon
      if (!icon && Array.isArray(item.levels) && item.levels.length > 0) {
        const lv = item.levels.find(l => l.displayIcon) || item.levels[0];
        icon = lv?.displayIcon || null;
      }
      // fallback: first chroma
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
    }).filter(s => s.displayIcon); // só mantêm itens com imagem

    // remove duplicatas
    const unique = [];
    const seen = new Set();
    skins.forEach(s => {
      if (!seen.has(s.uuid)) {
        seen.add(s.uuid);
        unique.push(s);
      }
    });

    setAvailableSkins(unique);
  };

  // Ao clicar numa arma: seleciona e busca skins
  const handleWeaponClick = (weaponName) => {
    const id = weaponsIdMap[weaponName];

    if (!id) {
      setNotification('Id inválido.');
      return;
    }

    setSelectedWeaponId(id);
    setSelectedWeaponName(weaponName);
    fetchSkinsForWeapon(id);
  };

  // adiciona skin ao inventário (POST) e atualiza estado local
  const addToInventory = async (skin) => {
    if (!username) {
      setNotification('Faça login para salvar skins.');
      setTimeout(() => setNotification(''), 3000);
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
        setUserInventory(data.inventory || []);
        // seta imagem da arma selecionada para a nova skin
        setWeaponImages(prev => ({ ...prev, [selectedWeaponName || '']: skin.displayIcon }));
        setNotification(`${skin.displayName} adicionada`);
      } else {
        const err = await res.json().catch(() => ({}));
        setNotification(`${err.error || 'Falha ao adicionar'}`);
      }
    } catch (err) {
      console.error('Erro ao adicionar inventário:', err);
      setNotification('✗ Erro de conexão ao salvar');
    } finally {
      setTimeout(() => setNotification(''), 3500);
    }
  };

  /**
   * handleSkinClick
   * - Se já existe exatamente essa skin no inventário, avisa.
   * - Se existe outra skin atribuída à mesma arma, remove-a primeiro (DELETE) e aí sim adiciona a nova (POST).
   * - Assim garantimos substituição no JSON (backend) e na UI.
   */
  const handleSkinClick = async (skin) => {
    if (!selectedWeaponId) {
      setNotification('Selecione a arma primeiro.');
      setTimeout(() => setNotification(''), 2000);
      return;
    }

    // Se já temos essa skin no inventário, só avisamos
    if (userInventory.some(i => i.skin_id === skin.uuid)) {
      setNotification('Você já possui esta skin!');
      setTimeout(() => setNotification(''), 2500);
      return;
    }

    // verifica se já existe uma skin no inventário que pertence a essa arma (por imagem mapeada)
    const currentWeaponName = selectedWeaponName;
    const currentMappedImage = weaponImages[currentWeaponName];

    if (currentMappedImage) {
      // tenta achar o item do inventário que tem essa imagem (assumindo que cada arma tem imagem única)
      const oldItem = userInventory.find(it => it.image_url === currentMappedImage);
      if (oldItem) {
        // remove do backend antes de adicionar a nova
        await removeFromInventory(oldItem.skin_id);
      }
    }

    // adiciona a nova skin (POST)
    await addToInventory(skin);
  };

  // Remove item do inventário (DELETE) e restaura imagem padrão se necessário
  const removeFromInventory = async (skin_id) => {
    // pega item atual para poder restaurar imagem padrão
    const removedItem = userInventory.find(item => item.skin_id === skin_id);
    try {
      const res = await fetch(`${API_BACK}/inventory/${encodeURIComponent(skin_id)}/?username=${encodeURIComponent(username)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setUserInventory(data.inventory || []);
        // se o item removido correspondia a alguma weaponImages entry, restaura a padrão
        if (removedItem && removedItem.image_url) {
          setWeaponImages(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(weapon => {
              if (updated[weapon] === removedItem.image_url) {
                // restaura imagem padrão (se existir) ou remove mapping
                if (DEFAULT_WEAPON_IMG[weapon]) updated[weapon] = DEFAULT_WEAPON_IMG[weapon];
                else delete updated[weapon];
              }
            });
            return updated;
          });
        }
        setNotification('✓ Item removido');
      } else {
        console.warn('Falha ao remover item', res.status);
      }
    } catch (err) {
      console.error('Erro ao remover do inventário:', err);
      setNotification('✗ Erro ao remover');
    } finally {
      setTimeout(() => setNotification(''), 2500);
    }
  };

  if (loading) return <div className="loading-state">Carregando inventário...</div>;

  const totalVP = userInventory.reduce((acc, it) => acc + (it.price || 0), 0);
  const totalBRL = (totalVP / 125) * 31.50;

  // renderiza botão de arma com imagem padrão ou skin aplicada
  const renderWeaponButton = (name) => {
    const image = weaponImages[name] || DEFAULT_WEAPON_IMG[name] || '';
    return (
      <button
        key={name}
        type="button"
        className={selectedWeaponName === name ? 'active' : ''}
        onClick={() => handleWeaponClick(name)}
      >
        <p>{name}</p>
        <div className="weapon-img-wrap">
          <img src={image} alt={name} />
        </div>
      </button>
    );
  };

  const searchSkins = async (e) => {
    e.preventDefault();
    console.log("aboborabrunoguazelibatista")
  }

  return (
    <main>
      {/* toast fixo (não altera layout) */}
      {notification && <div className="notification-toast">{notification}</div>}

      {/* Coluna Esquerda - Skins Disponíveis */}
      <div className="guns-skins">
        <div className="filter-skins">
          <form onSubmit={searchSkins} className="search-skins">
            <input className='input-search-skins' type="text" placeholder='Nome da Skin' required onChange={(e) => {setSearchSkin(e.target.value)}}/>
            <button type="submit" className='search-button'>Buscar</button>
          </form>
        </div>

        <div className="skins-api">
          {!selectedWeaponName ? (
            <div className="empty-state">Selecione uma arma ao lado →</div>
          ) : (
            availableSkins.length === 0 ? (
              <div className="empty-state">Nenhuma skin encontrada</div>
            ) : (
              availableSkins.map(skin => (
                <div
                  key={skin.uuid}
                  className="skin-button"
                  onClick={() => handleSkinClick(skin)}
                >
                  <img src={skin.displayIcon} alt={skin.displayName} />
                  <span>{skin.displayName}</span>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Coluna Central - Arsenal (4 colunas agrupadas como você queria) */}
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

      {/* Coluna Direita - Inventário e Preços */}
      <div className="money-counter">
        <div className="money-per-skin-api">
          <h4 className="inventory-title">Meu Inventário</h4>
          {userInventory.length === 0 ? (
            <div className="empty-state">Nenhuma skin adicionada</div>
          ) : (
            userInventory.map(item => (
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
