import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ThreeCarBuilder } from '../Visualizer/ThreeCarBuilder';
import {
  DrivePhysics,
  VINNYTSIA_LANDMARKS,
  VINNYTSIA_PRESET_ROUTES,
  DEFAULT_AUTOPILOT_ROUTE,
  ZAPORIZHZHIA_LANDMARKS,
  ZAPORIZHZHIA_PRESET_ROUTES,
  DEFAULT_ZAPORIZHZHIA_ROUTE,
  KYIV_LANDMARKS,
  KYIV_PRESET_ROUTES,
  DEFAULT_KYIV_ROUTE
} from './DrivePhysics';
import { buildVinnytsiaCity } from './VinnytsiaMap';
import { buildZaporizhzhiaCity } from './ZaporizhzhiaMap';
import { buildKyivCity } from './KyivMap';
import { HumanCharacter } from './HumanCharacter';
import { TrafficSystem } from './TrafficSystem';
import { PedestrianSystem } from './PedestrianSystem';
import { InteriorRoom, INTERIOR_ORIGIN } from './InteriorRoom';
import { setupCityAmenities } from './CityAmenities';
import SupermarketModal from './SupermarketModal';
import HousingModal from './HousingModal';
import PoliceStationModal from './PoliceStationModal';
import PhoneModal from './PhoneModal';
import GunShopModal from './GunShopModal';
import { MilitaryBaseModal } from './MilitaryBaseModal';
import { AirDefenseSystem } from './AirDefenseSystem';
import { MultiplayerManager } from './MultiplayerManager';
import { RemotePlayerRenderer } from './RemotePlayerRenderer';
import { MultiplayerModal } from './MultiplayerModal';
import { MultiplayerChat } from './MultiplayerChat';
import { ScoreboardOverlay } from './ScoreboardOverlay';
import { dynamicAudio } from '../../utils/engineAudio';
import {
  playHornSound,
  playClickSound,
  playCrashSound,
  playRepairSound,
  playTeslaAutopilotSound,
  playTotalWreckSound,
  playDoorSound,
  playPunchSwingSound,
  playPunchImpactSound,
  playEatingSound,
  playTvClickSound,
  playTaserSound,
  playGunshotSound,
  playHandcuffsSound,
  startPoliceSiren,
  stopPoliceSiren,
  isPoliceSirenActive,
  playPoliceRadioSound,
  playAccessDeniedSound,
  playPhoneRingtone,
  playPhoneMessageSound,
  playDsnsSirenSound,
  playExtinguisherSound,
  playGunCockSound,
  playAk47BurstSound,
  playTankCannonSound,
  playExplosionSound,
  startAirRaidSiren,
  stopAirRaidSiren
} from '../../utils/audioSynthesizer';
import { CAR_MODELS } from '../../types/car';
import {
  ArrowLeft,
  Camera,
  Wrench,
  Sparkles,
  AlertTriangle,
  MapPin,
  RotateCcw,
  Zap,
  Landmark,
  Route as RouteIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Flame,
  X,
  Navigation,
  Heart,
  Utensils,
  ShoppingBag,
  User,
  LogOut,
  LogIn,
  DollarSign,
  Home,
  Key,
  Tv,
  BedDouble,
  DoorOpen,
  Shield,
  Lock,
  Phone,
  Crosshair,
  Maximize2,
  Minimize2,
  Globe,
  Users,
  MessageSquare
} from 'lucide-react';

export default function TestDriveArena({ carConfig, onExitDrive }) {
  const mountRef = useRef(null);
  const physicsRef = useRef(new DrivePhysics(carConfig.modelId));
  const carBuilderRef = useRef(null);
  const collidersRef = useRef([]);
  const cityGroupRef = useRef(null);
  const screenShakeRef = useRef(0);
  const toggleAutopilotRef = useRef(null);
  const toggleAutoForwardRef = useRef(null);
  const isAutoForwardRef = useRef(false);
  const setSpeedLimitRef = useRef(null);
  const hasPlayedWreckSound = useRef(false);

  // Human, Traffic and Amenities refs
  const humanRef = useRef(null);
  const trafficSystemRef = useRef(null);
  const supermarketsRef = useRef([]);
  const parkingHubsRef = useRef([]);
  const gunShopsRef = useRef([]);
  const dsnsStationsRef = useRef([]);
  const openGunShopRef = useRef(null);
  const rootRef = useRef(null);
  const exitEnterCarRef = useRef(null);
  const openStoreRef = useRef(null);
  const sceneRef = useRef(null);

  // Keyboard state
  const keysRef = useRef({
    throttle: false,
    brake: false,
    steerLeft: false,
    steerRight: false,
    handbrake: false
  });

  // UI state
  const [telemetry, setTelemetry] = useState({
    speedKmh: 0,
    speedLimitKmh: null,
    rpm: 1000,
    gear: 1,
    driftScore: 0,
    isDrifting: false,
    health: 100,
    lastCrashObj: null,
    carX: 0,
    carZ: 25,
    isAutopilot: false,
    autopilotTarget: null,
    autopilotIdx: 0,
    autopilotRoute: DEFAULT_KYIV_ROUTE,
    routeCompleted: false,
    destruction: {}
  });

  const [cameraMode, setCameraMode] = useState('chase'); // 'chase' | 'cockpit' | 'top'
  const [crashBanner, setCrashBanner] = useState(null);
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [isAutoForward, setIsAutoForward] = useState(false);
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [customRoute, setCustomRoute] = useState(DEFAULT_KYIV_ROUTE);
  const [speedLimit, setSpeedLimit] = useState(null); // null (MAX), 50, 100, 200, 300
  const [selectedCity, setSelectedCity] = useState('kyiv'); // 'kyiv' | 'vinnytsia' | 'zaporizhzhia'

  // Human On-Foot, Survival, Amenities & Buyable Housing state
  const [isHumanOnFoot, setIsHumanOnFoot] = useState(false);
  const [humanHealth, setHumanHealth] = useState(100);
  const [humanHunger, setHumanHunger] = useState(100);
  const [playerMoney, setPlayerMoney] = useState(() => {
    try {
      const saved = localStorage.getItem('pr5_player_money');
      return saved !== null ? Number(saved) : 1500;
    } catch {
      return 1500;
    }
  });
  const [ownedProperties, setOwnedProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('pr5_owned_housing');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [housingProperties, setHousingProperties] = useState([]);
  const [nearHousing, setNearHousing] = useState(null);
  const [activeHousing, setActiveHousing] = useState(null);
  const [nearStore, setNearStore] = useState(null);
  const [activeStore, setActiveStore] = useState(null);
  const [currentParkingLot, setCurrentParkingLot] = useState(null);
  const [canEnterCar, setCanEnterCar] = useState(false);

  // 3D Interior & Melee Combat state
  const [activeInterior, setActiveInterior] = useState(null); // { property, streetPos }
  const [nearInteriorInteract, setNearInteriorInteract] = useState(null); // { type, name, prompt }
  const [combatBanner, setCombatBanner] = useState(null);

  // Police Profession, Weapons & Patrol Car state
  const [isPolice, setIsPolice] = useState(() => {
    try {
      return localStorage.getItem('pr5_is_police') === 'true';
    } catch {
      return false;
    }
  });
  const [policeArrests, setPoliceArrests] = useState(() => {
    try {
      const saved = localStorage.getItem('pr5_police_arrests');
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [equippedWeapon, setEquippedWeapon] = useState('fists'); // 'fists' | 'taser' | 'pistol' | 'handcuffs'
  const [nearPoliceStation, setNearPoliceStation] = useState(false);
  const [activePoliceStation, setActivePoliceStation] = useState(false);
  const [nearPoliceCar, setNearPoliceCar] = useState(false);
  const [isDrivingPoliceCar, setIsDrivingPoliceCar] = useState(false);
  const [isSirenOn, setIsSirenOn] = useState(false);

  // Phone, Gun Shop, Owned Weapons & Fullscreen state
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const isPhoneOpenRef = useRef(isPhoneOpen);
  isPhoneOpenRef.current = isPhoneOpen;

  // Military Profession (ЗСУ), Armor, Tanks & Air Defense state
  const [isArmy, setIsArmy] = useState(() => {
    try {
      return localStorage.getItem('pr5_is_army') === 'true';
    } catch {
      return false;
    }
  });
  const [shahedKills, setShahedKills] = useState(() => {
    try {
      const saved = localStorage.getItem('pr5_shahed_kills');
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [nearMilitaryBase, setNearMilitaryBase] = useState(false);
  const [activeMilitaryBase, setActiveMilitaryBase] = useState(false);
  const [nearTank, setNearTank] = useState(false);
  const [isDrivingTank, setIsDrivingTank] = useState(false);
  const [nearMilitaryCar, setNearMilitaryCar] = useState(false);
  const [isDrivingMilitaryCar, setIsDrivingMilitaryCar] = useState(false);

  const [activeGunShop, setActiveGunShop] = useState(null);
  const activeGunShopRef = useRef(activeGunShop);
  activeGunShopRef.current = activeGunShop;

  const [nearGunShop, setNearGunShop] = useState(null);
  const nearGunShopRef = useRef(nearGunShop);
  nearGunShopRef.current = nearGunShop;

  const [ownedWeapons, setOwnedWeapons] = useState(() => {
    try {
      const saved = localStorage.getItem('pr5_owned_weapons');
      return saved ? JSON.parse(saved) : ['fists'];
    } catch {
      return ['fists'];
    }
  });
  const ownedWeaponsRef = useRef(ownedWeapons);
  ownedWeaponsRef.current = ownedWeapons;

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Multiplayer system state & refs
  const multiplayerManagerRef = useRef(null);
  const remotePlayerRendererRef = useRef(null);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isChatOpenRef = useRef(false);
  isChatOpenRef.current = isChatOpen;
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [connectedPlayersList, setConnectedPlayersList] = useState([]);
  const [multiplayerStatus, setMultiplayerStatus] = useState('offline');
  const lastNetworkSyncTime = useRef(0);

  // Sync refs for event listeners & requestAnimationFrame loop
  const isHumanOnFootRef = useRef(isHumanOnFoot);
  isHumanOnFootRef.current = isHumanOnFoot;
  const activeStoreRef = useRef(activeStore);
  activeStoreRef.current = activeStore;
  const nearStoreRef = useRef(nearStore);
  nearStoreRef.current = nearStore;
  const canEnterCarRef = useRef(canEnterCar);
  canEnterCarRef.current = canEnterCar;
  const housingListRef = useRef([]);
  const nearHousingRef = useRef(nearHousing);
  nearHousingRef.current = nearHousing;
  const activeHousingRef = useRef(activeHousing);
  activeHousingRef.current = activeHousing;
  const openHousingRef = useRef(null);
  const ownedPropertiesRef = useRef(ownedProperties);
  ownedPropertiesRef.current = ownedProperties;

  // Police refs
  const isPoliceRef = useRef(isPolice);
  isPoliceRef.current = isPolice;
  const policeStationRef = useRef(null);
  const nearPoliceStationRef = useRef(nearPoliceStation);
  nearPoliceStationRef.current = nearPoliceStation;
  const activePoliceStationRef = useRef(activePoliceStation);
  activePoliceStationRef.current = activePoliceStation;
  const openPoliceStationRef = useRef(null);
  const nearPoliceCarRef = useRef(nearPoliceCar);
  nearPoliceCarRef.current = nearPoliceCar;
  const isDrivingPoliceCarRef = useRef(isDrivingPoliceCar);
  isDrivingPoliceCarRef.current = isDrivingPoliceCar;
  const isSirenOnRef = useRef(isSirenOn);
  isSirenOnRef.current = isSirenOn;
  const toggleSirenRef = useRef(null);
  const weaponActionTriggerRef = useRef(null);
  const equipWeaponRef = useRef(null);

  // Military & Air Defense refs
  const isArmyRef = useRef(isArmy);
  isArmyRef.current = isArmy;
  const shahedKillsRef = useRef(shahedKills);
  shahedKillsRef.current = shahedKills;
  const isAlarmActiveRef = useRef(isAlarmActive);
  isAlarmActiveRef.current = isAlarmActive;
  const militaryBaseRef = useRef(null);
  const nearMilitaryBaseRef = useRef(nearMilitaryBase);
  nearMilitaryBaseRef.current = nearMilitaryBase;
  const activeMilitaryBaseRef = useRef(activeMilitaryBase);
  activeMilitaryBaseRef.current = activeMilitaryBase;
  const openMilitaryBaseRef = useRef(null);
  const nearTankRef = useRef(nearTank);
  nearTankRef.current = nearTank;
  const isDrivingTankRef = useRef(isDrivingTank);
  isDrivingTankRef.current = isDrivingTank;
  const nearMilitaryCarRef = useRef(nearMilitaryCar);
  nearMilitaryCarRef.current = nearMilitaryCar;
  const isDrivingMilitaryCarRef = useRef(isDrivingMilitaryCar);
  isDrivingMilitaryCarRef.current = isDrivingMilitaryCar;
  const airDefenseRef = useRef(null);
  const tankCannonCooldownRef = useRef(0);
  const fireTankCannonRef = useRef(null);

  const pedestrianSystemRef = useRef(null);
  const interiorRoomRef = useRef(null);
  const activeInteriorRef = useRef(activeInterior);
  activeInteriorRef.current = activeInterior;
  const nearInteriorInteractRef = useRef(nearInteriorInteract);
  nearInteriorInteractRef.current = nearInteriorInteract;
  const punchRef = useRef(null);
  const enterInteriorRef = useRef(null);
  const exitInteriorRef = useRef(null);
  const interiorInteractRef = useRef(null);

  // Persist Money, Owned Housing and Police Rank in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pr5_player_money', String(playerMoney));
    } catch {}
  }, [playerMoney]);

  useEffect(() => {
    try {
      localStorage.setItem('pr5_owned_housing', JSON.stringify(ownedProperties));
    } catch {}
  }, [ownedProperties]);

  useEffect(() => {
    try {
      localStorage.setItem('pr5_is_police', String(isPolice));
    } catch {}
  }, [isPolice]);

  useEffect(() => {
    try {
      localStorage.setItem('pr5_police_arrests', String(policeArrests));
    } catch {}
  }, [policeArrests]);

  useEffect(() => {
    try {
      localStorage.setItem('pr5_is_army', String(isArmy));
    } catch {}
  }, [isArmy]);

  useEffect(() => {
    try {
      localStorage.setItem('pr5_shahed_kills', String(shahedKills));
    } catch {}
  }, [shahedKills]);

  useEffect(() => {
    try {
      localStorage.setItem('pr5_owned_weapons', JSON.stringify(ownedWeapons));
    } catch {}
  }, [ownedWeapons]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Toggle Fullscreen mode
  const toggleFullscreen = () => {
    playClickSound();
    const elem = rootRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };
  const toggleFullscreenRef = useRef(null);
  toggleFullscreenRef.current = toggleFullscreen;
  const toggleCameraRef = useRef(null);

  const model = CAR_MODELS[carConfig.modelId] || CAR_MODELS.bmw;
  const isTesla = carConfig.modelId === 'tesla' || carConfig.modelId === 'cybertruck';

  const getAutopilotBrandName = (id) => {
    switch (id) {
      case 'zaporozhets':
        return 'ЗАЗ "АВТО-КОЗАЦТВО" КРУЇЗ';
      case 'gwagon':
        return 'MERCEDES DRIVE PILOT';
      case 'audi_rs6':
        return 'AUDI PILOTED DRIVING';
      case 'porsche':
        return 'PORSCHE INNODRIVE';
      case 'lambo':
        return 'LAMBO ALA AUTODRIVE';
      case 'bmw':
        return 'BMW DRIVING ASSISTANT PRO';
      case 'bus':
        return 'VW TRAVEL ASSIST';
      case 'ferrari':
        return 'FERRARI MANETTINO PILOT';
      case 'gtr':
        return 'NISSAN PRO-PILOT NISMO GT';
      case 'mustang':
        return 'FORD CO-PILOT360 TRACK';
      case 'bugatti':
        return 'BUGATTI PILOTE DE COURSE';
      case 'zeekr':
        return 'ZEEKR NZP (NAVIGATION ZEEKR PILOT)';
      case 'cybertruck':
      case 'tesla':
      default:
        return 'TESLA FSD (FULL SELF-DRIVING)';
    }
  };

  // 3D Scene setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Sky Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090d16, 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 400);
    camera.position.set(0, 4, -8);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 4. Lighting for Vinnytsia Night / Dusk
    const ambient = new THREE.AmbientLight(0x60a5fa, 0.65);
    scene.add(ambient);

    const moon = new THREE.DirectionalLight(0xffffff, 2.2);
    moon.position.set(30, 60, 30);
    moon.castShadow = true;
    moon.shadow.mapSize.width = 2048;
    moon.shadow.mapSize.height = 2048;
    moon.shadow.camera.left = -60;
    moon.shadow.camera.right = 60;
    moon.shadow.camera.top = 60;
    moon.shadow.camera.bottom = -60;
    scene.add(moon);

    // 5. Build 3D City (Vinnytsia / Zaporizhzhia)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);
    cityGroupRef.current = cityGroup;
    sceneRef.current = scene;

    if (selectedCity === 'kyiv') {
      collidersRef.current = buildKyivCity(cityGroup);
      if (physicsRef.current) {
        physicsRef.current.resetPosition(0, -10, 0);
        physicsRef.current.setRoute(DEFAULT_KYIV_ROUTE);
      }
    } else if (selectedCity === 'zaporizhzhia') {
      collidersRef.current = buildZaporizhzhiaCity(cityGroup);
      if (physicsRef.current) {
        physicsRef.current.resetPosition(120, -100, Math.PI);
        physicsRef.current.setRoute(DEFAULT_ZAPORIZHZHIA_ROUTE);
      }
    } else {
      collidersRef.current = buildVinnytsiaCity(cityGroup);
      if (physicsRef.current) {
        physicsRef.current.resetPosition(0, -5, 0);
        physicsRef.current.setRoute(DEFAULT_AUTOPILOT_ROUTE);
      }
    }

    // 5b. Amenities (Supermarkets, Parking Lots, Housing, Police, Gun Shop, DSNS, Military Base)
    const amenities = setupCityAmenities(cityGroup, selectedCity, collidersRef.current);
    supermarketsRef.current = amenities.supermarkets;
    parkingHubsRef.current = amenities.parkingHubs;
    housingListRef.current = amenities.housingProperties || [];
    setHousingProperties(amenities.housingProperties || []);
    policeStationRef.current = amenities.policeStation || null;
    gunShopsRef.current = amenities.gunShops || [];
    dsnsStationsRef.current = amenities.dsnsStations || [];
    militaryBaseRef.current = amenities.militaryBase || null;

    // 5c. Air Defense System (Shahed-136 UAVs, Sirens & Interception)
    const airDefense = new AirDefenseSystem(scene);
    airDefenseRef.current = airDefense;

    // 5d. Human Character Controller
    const human = new HumanCharacter(scene);
    human.setProfession(isArmyRef.current ? 'army' : isPoliceRef.current ? 'police' : 'civilian');
    human.setEquippedWeapon(isArmyRef.current ? (equippedWeapon || 'ak74') : isPoliceRef.current ? equippedWeapon : 'fists');
    humanRef.current = human;

    // 5d. Autonomous AI Traffic Bots
    const traffic = new TrafficSystem(scene, selectedCity);
    trafficSystemRef.current = traffic;

    // 5e. Pedestrian NPC System (Street combat & pedestrians)
    const pedestrians = new PedestrianSystem(scene, selectedCity);
    pedestrianSystemRef.current = pedestrians;

    // 5f. 3D Enterable Interior Room System
    const interiorRoom = new InteriorRoom(scene);
    interiorRoomRef.current = interiorRoom;

    // 5g. Multiplayer Manager & 3D Remote Players Renderer
    const multiplayer = new MultiplayerManager();
    multiplayerManagerRef.current = multiplayer;

    const remoteRenderer = new RemotePlayerRenderer(scene);
    remotePlayerRendererRef.current = remoteRenderer;

    multiplayer.onPlayersUpdate = (playersMap) => {
      remoteRenderer.syncPlayers(playersMap);
      setConnectedPlayersList(Array.from(playersMap.values()));
    };

    multiplayer.onChatMessage = (msg) => {
      remoteRenderer.showChatBubble(msg.senderId, msg.text);
    };

    multiplayer.onActionEvent = (act) => {
      if (act.actionType === 'tank_fire') {
        playTankCannonSound();
      } else if (act.actionType === 'alarm_start') {
        airDefenseRef.current?.triggerAirAlarm();
      }
    };

    multiplayer.onStatusChange = (status) => {
      setMultiplayerStatus(status);
    };

    // 6. Build the Player's Car
    const builder = new ThreeCarBuilder(scene);
    builder.buildCar(carConfig);
    carBuilderRef.current = builder;

    // 6b. Dynamic Rooftop Police Strobe Lightbar (active when driving police patrol car)
    const policeStrobeBar = new THREE.Group();
    policeStrobeBar.position.set(0, 1.48, -0.2);
    policeStrobeBar.visible = false;
    builder.carGroup.add(policeStrobeBar);

    const strobeMount = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.06, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 })
    );
    policeStrobeBar.add(strobeMount);

    const strobeBlueMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.14, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 2.5 })
    );
    strobeBlueMesh.position.set(0.32, 0.08, 0);
    policeStrobeBar.add(strobeBlueMesh);

    const strobeRedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.14, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xb91c1c, emissiveIntensity: 2.5 })
    );
    strobeRedMesh.position.set(-0.32, 0.08, 0);
    policeStrobeBar.add(strobeRedMesh);

    const strobeBlueLight = new THREE.PointLight(0x3b82f6, 0, 15);
    strobeBlueLight.position.set(0.6, 0.3, 0);
    policeStrobeBar.add(strobeBlueLight);

    const strobeRedLight = new THREE.PointLight(0xef4444, 0, 15);
    strobeRedLight.position.set(-0.6, 0.3, 0);
    policeStrobeBar.add(strobeRedLight);

    // Start engine audio
    dynamicAudio.start(carConfig.modelId);

    // 7. Sparks Particle System
    const sparkGeo = new THREE.BufferGeometry();
    const sparkCount = 60;
    const sparkPositions = new Float32Array(sparkCount * 3);
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.3, transparent: true, opacity: 0 });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkPoints);

    // 8. 3D Flying Debris Particle Pool (Car Smashing Physics)
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);
    const debrisCount = 30;
    const debrisList = [];
    const shardGeos = [
      new THREE.BoxGeometry(0.25, 0.15, 0.08),
      new THREE.TetrahedronGeometry(0.18),
      new THREE.BoxGeometry(0.35, 0.06, 0.2)
    ];
    const debrisMats = [
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 }),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, transparent: true, roughness: 0.1 })
    ];

    for (let i = 0; i < debrisCount; i++) {
      const mesh = new THREE.Mesh(shardGeos[i % shardGeos.length], debrisMats[i % debrisMats.length]);
      mesh.visible = false;
      mesh.vx = 0;
      mesh.vy = 0;
      mesh.vz = 0;
      mesh.rotVx = 0;
      mesh.rotVy = 0;
      debrisGroup.add(mesh);
      debrisList.push(mesh);
    }

    // 9. Engine Fire & Smoke System (When car is wrecked)
    const smokeGeo = new THREE.BufferGeometry();
    const smokeCount = 45;
    const smokePositions = new Float32Array(smokeCount * 3);
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0x18181b,
      size: 0.85,
      transparent: true,
      opacity: 0
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokePoints);

    // Engine fire point light
    const engineFireLight = new THREE.PointLight(0xff4500, 0, 12);
    scene.add(engineFireLight);

    // 9b. Car Interaction Ring on ground (visible in human mode)
    const carRingGeo = new THREE.RingGeometry(3.2, 3.8, 32);
    const carRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const carGlowRing = new THREE.Mesh(carRingGeo, carRingMat);
    carGlowRing.rotation.x = -Math.PI / 2;
    carGlowRing.position.y = 0.06;
    carGlowRing.visible = false;
    scene.add(carGlowRing);

    // 10. 3D Waypoint Beacons (Route Pins in 3D Scene)
    const beaconsGroup = new THREE.Group();
    scene.add(beaconsGroup);

    const updateBeacons = (route) => {
      while (beaconsGroup.children.length > 0) {
        beaconsGroup.remove(beaconsGroup.children[0]);
      }
      route.forEach((wp, idx) => {
        const bg = new THREE.Group();
        bg.position.set(wp.x, 0, wp.z);

        // Vertical cyan light column
        const column = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 3.5, 16),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
        );
        column.position.y = 1.75;
        bg.add(column);

        // Ground target pulse ring
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.8, 1.3, 24),
          new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        bg.add(ring);

        // Spinning diamond / star on top
        const diamond = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.55),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 })
        );
        diamond.position.y = 3.6;
        diamond.name = 'diamond';
        bg.add(diamond);

        beaconsGroup.add(bg);
      });
    };
    updateBeacons(selectedCity === 'kyiv' ? DEFAULT_KYIV_ROUTE : selectedCity === 'zaporizhzhia' ? DEFAULT_ZAPORIZHZHIA_ROUTE : DEFAULT_AUTOPILOT_ROUTE);

    // 11. Tesla FSD Blue Trajectory Ribbon
    const maxPathPoints = 40;
    const pathPositions = new Float32Array(maxPathPoints * 3);
    const pathGeo = new THREE.BufferGeometry();
    pathGeo.setAttribute('position', new THREE.BufferAttribute(pathPositions, 3));
    const pathMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 4,
      transparent: true,
      opacity: 0.85
    });
    const pathLine = new THREE.Line(pathGeo, pathMat);
    pathLine.visible = false;
    scene.add(pathLine);

    // 12. Keyboard input listeners
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();

      // In-Game Chat active: ignore vehicle movement controls
      if (isChatOpenRef.current) {
        if (e.key === 'Escape') {
          setIsChatOpen(false);
        }
        return;
      }

      // Multiplayer Chat toggle: Key T / 'Е'
      if (e.code === 'KeyT' || k === 't' || k === 'е') {
        e.preventDefault();
        setIsChatOpen(prev => !prev);
        return;
      }

      // Scoreboard overlay: Key Tab
      if (e.code === 'Tab') {
        e.preventDefault();
        setIsScoreboardOpen(prev => !prev);
        return;
      }

      // Smartphone toggle: Key P / 'З'
      if (e.code === 'KeyP' || k === 'p' || k === 'з') {
        playClickSound();
        setIsPhoneOpen(prev => !prev);
        return;
      }

      if (isPhoneOpenRef.current) {
        if (e.key === 'Escape' || e.code === 'Escape') {
          playClickSound();
          setIsPhoneOpen(false);
        }
        return;
      }
      if (activeMilitaryBaseRef.current) {
        if (e.key === 'Escape' || e.code === 'Escape') {
          setActiveMilitaryBase(false);
        }
        return;
      }
      if (airDefenseRef.current?.isFpvActive) {
        if (e.key === 'Escape' || e.code === 'Escape' || k === '0') {
          airDefenseRef.current.exitFpvDrone();
          return;
        }
      }
      if (activeGunShopRef.current) {
        if (e.key === 'Escape') {
          setActiveGunShop(null);
        }
        return;
      }
      if (activePoliceStationRef.current) {
        if (e.key === 'Escape') {
          setActivePoliceStation(false);
        }
        return;
      }
      if (activeStoreRef.current) {
        if (e.key === 'Escape') {
          setActiveStore(null);
        }
        return;
      }
      if (activeHousingRef.current) {
        if (e.key === 'Escape') {
          setActiveHousing(null);
        }
        return;
      }
      if (activeInteriorRef.current) {
        if (e.key === 'Escape') {
          if (exitInteriorRef.current) exitInteriorRef.current();
          return;
        }
        if (e.code === 'KeyE' || k === 'e' || k === 'у' || k === 'enter' || e.code === 'KeyF' || k === 'f' || k === 'а') {
          if (nearInteriorInteractRef.current && interiorInteractRef.current) {
            interiorInteractRef.current(nearInteriorInteractRef.current);
            return;
          }
        }
      }

      if (k === 'w' || k === 'arrowup' || k === 'ц') keysRef.current.throttle = true;
      if (k === 's' || k === 'arrowdown' || k === 'і' || k === 'ы') keysRef.current.brake = true;
      if (k === 'a' || k === 'arrowleft' || k === 'ф') keysRef.current.steerLeft = true;
      if (k === 'd' || k === 'arrowright' || k === 'в') keysRef.current.steerRight = true;
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (e.code === 'Space') {
          e.preventDefault();
          if (isDrivingTankRef.current || isDrivingMilitaryCarRef.current) {
            if (fireTankCannonRef.current) fireTankCannonRef.current();
          }
        }
        keysRef.current.handbrake = true;
      }

      // Punch / Weapon Attack or Tank Cannon: Key Q / 'Й'
      if (e.code === 'KeyQ' || k === 'q' || k === 'й') {
        if (isDrivingTankRef.current || isDrivingMilitaryCarRef.current) {
          if (fireTankCannonRef.current) fireTankCannonRef.current();
        } else if ((isHumanOnFootRef.current || activeInteriorRef.current) && punchRef.current) {
          punchRef.current();
        }
      }

      // Enter or exit car with 'E' / 'У'
      if (e.code === 'KeyE' || k === 'e' || k === 'у') {
        if (!activeInteriorRef.current && exitEnterCarRef.current) exitEnterCarRef.current();
      }
      // Military Base / Police Station / Gun Shop / Housing / Supermarket / Autopilot (F or Enter)
      if (e.code === 'KeyF' || k === 'f' || k === 'а' || k === 'enter') {
        if (nearMilitaryBaseRef.current) {
          if (openMilitaryBaseRef.current) openMilitaryBaseRef.current();
        } else if (nearPoliceStationRef.current) {
          if (openPoliceStationRef.current) openPoliceStationRef.current();
        } else if (nearGunShopRef.current) {
          if (openGunShopRef.current) openGunShopRef.current();
        } else if (nearHousingRef.current) {
          if (openHousingRef.current) openHousingRef.current();
        } else if (nearStoreRef.current) {
          if (openStoreRef.current) openStoreRef.current();
        } else if (!isHumanOnFootRef.current && toggleAutopilotRef.current && (e.code === 'KeyF' || k === 'f' || k === 'а')) {
          toggleAutopilotRef.current();
        }
      }
      // Auto-Forward Cruise with Key V / 'М'
      if (e.code === 'KeyV' || k === 'v' || k === 'м') {
        if (toggleAutoForwardRef.current) toggleAutoForwardRef.current();
      }
      // Police Siren & Lights with Key G / 'П' (when driving police patrol car)
      if (e.code === 'KeyG' || k === 'g' || k === 'п') {
        if (!isHumanOnFootRef.current && toggleSirenRef.current) toggleSirenRef.current();
      }
      if (k === 'h' || k === 'р') playHornSound();
      // Fullscreen mode toggle: Key C / 'С'
      if (e.code === 'KeyC' || k === 'c' || k === 'с') {
        if (toggleFullscreenRef.current) toggleFullscreenRef.current();
        else toggleFullscreen();
      }
      // Camera perspective toggle: Key X / 'Ч'
      if (e.code === 'KeyX' || k === 'x' || k === 'ч') {
        if (toggleCameraRef.current) toggleCameraRef.current();
        else toggleCamera();
      }
      if (k === 'r' || k === 'к') handleRepair();

      // On-foot: Keys 1-7 (civilian/police), 8-0 (ZSU Army: AK-74, Stinger, Drone). In car: Keys 1-4 set speed limit.
      if (isHumanOnFootRef.current) {
        if (k === '1' && equipWeaponRef.current) equipWeaponRef.current('fists');
        if (k === '2' && equipWeaponRef.current) equipWeaponRef.current('taser');
        if (k === '3' && equipWeaponRef.current) equipWeaponRef.current('pistol');
        if (k === '4' && equipWeaponRef.current) equipWeaponRef.current('handcuffs');
        if (k === '5' && equipWeaponRef.current) equipWeaponRef.current('spray');
        if (k === '6' && equipWeaponRef.current) equipWeaponRef.current('baton');
        if (k === '7' && equipWeaponRef.current) equipWeaponRef.current('shotgun');
        if (k === '8' && equipWeaponRef.current) equipWeaponRef.current('ak74');
        if (k === '9' && equipWeaponRef.current) equipWeaponRef.current('stinger');
        if (k === '0' && equipWeaponRef.current) equipWeaponRef.current('drone');
      } else {
        if (k === '1' && setSpeedLimitRef.current) setSpeedLimitRef.current(50);
        if (k === '2' && setSpeedLimitRef.current) setSpeedLimitRef.current(100);
        if (k === '3' && setSpeedLimitRef.current) setSpeedLimitRef.current(200);
        if (k === '4' && setSpeedLimitRef.current) setSpeedLimitRef.current(300);
        if ((k === '0' || k === '`') && setSpeedLimitRef.current) setSpeedLimitRef.current(null);
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup' || k === 'ц') keysRef.current.throttle = false;
      if (k === 's' || k === 'arrowdown' || k === 'і' || k === 'ы') keysRef.current.brake = false;
      if (k === 'a' || k === 'arrowleft' || k === 'ф') keysRef.current.steerLeft = false;
      if (k === 'd' || k === 'arrowright' || k === 'в') keysRef.current.steerRight = false;
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysRef.current.handbrake = false;
      }
      if (e.code === 'Tab') {
        setIsScoreboardOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 13. Physics & Render Loop
    let lastTime = performance.now();
    let animationFrameId;

    const loop = (now) => {
      animationFrameId = requestAnimationFrame(loop);
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // When grocery supermarket, housing modal, police station modal, gun shop, military base or phone is open, pause physics and only render background
      if (activeStoreRef.current || activeHousingRef.current || activePoliceStationRef.current || activeGunShopRef.current || activeMilitaryBaseRef.current || isPhoneOpenRef.current) {
        renderer.render(scene, camera);
        return;
      }

      // Animate spinning diamonds on beacon posts
      beaconsGroup.children.forEach(b => {
        const d = b.getObjectByName('diamond');
        if (d) d.rotation.y += dt * 2.2;
      });

      // ================= 3D INTERIOR LIVING MODE =================
      if (activeInteriorRef.current) {
        pathLine.visible = false;
        carGlowRing.visible = false;

        const p = physicsRef.current;
        p.speed = 0;
        p.steeringAngle = 0;

        const intColliders = interiorRoomRef.current ? interiorRoomRef.current.getColliders() : [];
        const humanState = humanRef.current?.update(keysRef.current, dt, intColliders);

        if (humanState) {
          // Check interior interactions (Bed, Fridge, TV, Door)
          const foundInteract = interiorRoomRef.current?.checkInteractions(humanState.x, humanState.z);
          setNearInteriorInteract(foundInteract || null);

          // Camera inside room: smooth follow behind human character
          const camDist = 3.6;
          const camHeight = 1.9;
          const camX = humanState.x - Math.sin(humanState.yaw) * camDist;
          const camY = INTERIOR_ORIGIN.y + camHeight;
          const camZ = humanState.z - Math.cos(humanState.yaw) * camDist;
          camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.2);
          camera.lookAt(humanState.x, INTERIOR_ORIGIN.y + 1.25, humanState.z);

          setTelemetry({
            speedKmh: humanState.speedKmh,
            rpm: 0,
            gear: '🏠 ДІМ',
            driftScore: 0,
            isDrifting: false,
            health: humanHealth,
            carX: humanState.x,
            carZ: humanState.z,
            isAutopilot: false,
            autopilotTarget: null,
            autopilotIdx: 0,
            autopilotRoute: [],
            routeCompleted: false,
            destruction: {}
          });
        }

        renderer.render(scene, camera);
        return;
      }

      if (isHumanOnFootRef.current) {
        // ================= HUMAN ON-FOOT MODE =================
        pathLine.visible = false;

        // Keep vehicle strictly stationary at its parked location
        const p = physicsRef.current;
        p.speed = 0;
        p.steeringAngle = 0;

        // Keep 3D car mesh locked at parked position
        if (builder.carGroup) {
          builder.carGroup.position.set(p.x, 0, p.z);
          builder.carGroup.rotation.y = p.yaw;
        }

        // Show glowing entrance zone ring around parked car
        carGlowRing.visible = true;
        carGlowRing.position.set(p.x, 0.06, p.z);
        carRingMat.opacity = 0.5 + Math.sin(now * 0.006) * 0.3;

        // Update 3D human character
        const humanState = humanRef.current?.update(keysRef.current, dt, collidersRef.current);
        if (humanState) {
          // Check proximity to car (generous 8.0m radius for all car sizes)
          const distToCar = Math.hypot(humanState.x - p.x, humanState.z - p.z);
          setCanEnterCar(distToCar < 8.0);

          // Check proximity to supermarket entrance
          const foundStore = supermarketsRef.current?.find(
            s => Math.hypot(humanState.x - s.entranceX, humanState.z - s.entranceZ) < s.radius
          );
          setNearStore(foundStore || null);

          // Check proximity to buyable housing property
          const foundHousing = housingListRef.current?.find(
            h => Math.hypot(humanState.x - h.entranceX, humanState.z - h.entranceZ) < h.radius
          );
          setNearHousing(foundHousing || null);

          // Check proximity to Gun Shop
          const foundGunShop = gunShopsRef.current?.find(
            g => Math.hypot(humanState.x - g.entranceX, humanState.z - g.entranceZ) < (g.radius || 4.5)
          );
          setNearGunShop(foundGunShop || null);

          // Check proximity to police station entrance & dedicated patrol car
          if (policeStationRef.current) {
            const ps = policeStationRef.current;
            const distToStation = Math.hypot(humanState.x - ps.entranceX, humanState.z - ps.entranceZ);
            setNearPoliceStation(distToStation < (ps.radius || 4.2));

            if (ps.policeCar) {
              const distToPoliceCar = Math.hypot(humanState.x - ps.policeCar.x, humanState.z - ps.policeCar.z);
              setNearPoliceCar(distToPoliceCar < (ps.policeCar.radius || 4.8));
            }
          } else {
            setNearPoliceStation(false);
            setNearPoliceCar(false);
          }

          // Check proximity to Military Base entrance, Tank, and Combat Car
          if (militaryBaseRef.current) {
            const mb = militaryBaseRef.current;
            const distToBase = Math.hypot(humanState.x - mb.entranceX, humanState.z - mb.entranceZ);
            const distToTank = mb.tank ? Math.hypot(humanState.x - mb.tank.x, humanState.z - mb.tank.z) : 999;
            const distToMilCar = mb.militaryCar ? Math.hypot(humanState.x - mb.militaryCar.x, humanState.z - mb.militaryCar.z) : 999;
            setNearMilitaryBase(distToBase < (mb.radius || 15.0) || distToTank < 12.0 || distToMilCar < 12.0);

            if (mb.tank) {
              setNearTank(distToTank < (mb.tank.radius || 8.0));
            }
            if (mb.militaryCar) {
              setNearMilitaryCar(distToMilCar < (mb.militaryCar.radius || 8.0));
            }
          } else {
            setNearMilitaryBase(false);
            setNearTank(false);
            setNearMilitaryCar(false);
          }

          // Check parking lot occupancy
          const foundLot = parkingHubsRef.current?.find(
            lot => Math.abs(humanState.x - lot.x) < lot.width / 2 && Math.abs(humanState.z - lot.z) < lot.depth / 2
          );
          setCurrentParkingLot(foundLot ? foundLot.name : null);

          // Survival hunger & health drain (running burns more calories)
          const hungerDrain = (humanState.isRunning ? 0.32 : 0.16) * dt;
          setHumanHunger(prevH => {
            const nextH = Math.max(0, prevH - hungerDrain);
            if (nextH === 0) {
              setHumanHealth(prevHp => Math.max(0, prevHp - 1.2 * dt));
            }
            return nextH;
          });

          // Traffic bots interaction with human pedestrian
          const trafficRes = trafficSystemRef.current?.update(
            dt,
            { x: p.x, z: p.z, yaw: p.yaw, speedKmh: 0 },
            { x: humanState.x, z: humanState.z },
            true
          );

          if (trafficRes?.hitHumanEvent) {
            setHumanHealth(prevHp => Math.max(0, prevHp - trafficRes.hitHumanEvent.damage));
            playCrashSound(trafficRes.hitHumanEvent.force);
            setCrashBanner({
              name: `💥 ВАС ЗБИВ ${trafficRes.hitHumanEvent.botName}! (-${trafficRes.hitHumanEvent.damage}% HP)`,
              force: trafficRes.hitHumanEvent.force,
              isFsd: false
            });
            setTimeout(() => setCrashBanner(null), 3000);
          }

          // NPC Pedestrians update & Street Combat / Police Law Enforcement
          const currentWeaponAction = weaponActionTriggerRef.current;
          weaponActionTriggerRef.current = null;

          // Anti-Air Interception with AK-74, Stinger or FPV Drone
          if (currentWeaponAction && (currentWeaponAction.type === 'ak74' || currentWeaponAction.type === 'stinger' || currentWeaponAction.isAntiAir)) {
            const aimX = -Math.sin(humanState.yaw);
            const aimY = 0.38;
            const aimZ = -Math.cos(humanState.yaw);
            const normAim = Math.hypot(aimX, aimY, aimZ);
            const aimDir = { x: aimX / normAim, y: aimY / normAim, z: aimZ / normAim };

            const hitRes = airDefenseRef.current?.checkWeaponHit(
              { x: humanState.x, y: 1.5, z: humanState.z },
              aimDir,
              currentWeaponAction
            );

            if (hitRes?.type === 'destroyed') {
              setShahedKills(k => k + 1);
              setPlayerMoney(m => m + (hitRes.reward || 500));
              setCombatBanner({
                text: `🎯 ЦІЛЬ ЗНИЩЕНО! «Шахед-136» збито з ${currentWeaponAction.type === 'stinger' ? 'ПЗРК' : 'АК-74'}! (+₴500)`,
                type: 'knockout'
              });
              setTimeout(() => setCombatBanner(null), 3500);
            } else if (hitRes?.type === 'hit') {
              setCombatBanner({
                text: `🎯 ВЛУЧАННЯ ПО «ШАХЕДУ»! (HP цілі: ${hitRes.remainingHp})`,
                type: 'punch'
              });
              setTimeout(() => setCombatBanner(null), 1500);
            }
          } else if (currentWeaponAction?.type === 'drone') {
            airDefenseRef.current?.deployFpvDrone({ x: humanState.x, y: 1.5, z: humanState.z }, humanState.yaw);
            setCombatBanner({
              text: '🎮 FPV-ДРОН АКТИВОВАНО! Керуйте WASD + Space для тарану шахеда! [ESC] — вихід',
              type: 'cash'
            });
            setTimeout(() => setCombatBanner(null), 4000);
          }

          const pedEvents = pedestrianSystemRef.current?.update(
            dt,
            humanState,
            { x: p.x, z: p.z, yaw: p.yaw, speedKmh: 0 },
            true,
            camera,
            currentWeaponAction,
            isPoliceRef.current
          );

          if (pedEvents && pedEvents.length > 0) {
            pedEvents.forEach(evt => {
              if (evt.type === 'player_tasered_npc') {
                setCombatBanner({
                  text: `⚡ ТАЙЗЕР! [${evt.npcName}] паралізовано електрошоком на 4с!`,
                  type: 'taser'
                });
                setTimeout(() => setCombatBanner(null), 2500);
              } else if (evt.type === 'player_shot_npc') {
                setCombatBanner({
                  text: `🔫 ПОСТРІЛ! Нанесено ${evt.damage} шкоди [${evt.npcName}]!`,
                  type: 'shot'
                });
                setTimeout(() => setCombatBanner(null), 2500);
              } else if (evt.type === 'player_sprayed_npc') {
                setCombatBanner({
                  text: `💨 БАЛОНЧИК ТЕРЕН-4М! [${evt.npcName}] осліплено газом на 5с!`,
                  type: 'spray'
                });
                setTimeout(() => setCombatBanner(null), 2500);
              } else if (evt.type === 'player_batoned_npc') {
                setCombatBanner({
                  text: `🦯 КИЙОК ПР-73! Нанесено ${evt.damage} шкоди [${evt.npcName}]!`,
                  type: 'baton'
                });
                setTimeout(() => setCombatBanner(null), 2500);
              } else if (evt.type === 'player_shotgunned_npc') {
                setCombatBanner({
                  text: `💥 ПОМПОВИЙ ДРОБОВИК! ${evt.damage} шкоди [${evt.npcName}]!`,
                  type: 'shotgun'
                });
                setTimeout(() => setCombatBanner(null), 2500);
              } else if (evt.type === 'player_arrested_npc') {
                setPoliceArrests(prev => prev + 1);
                setPlayerMoney(prev => prev + evt.reward);
                setCombatBanner({
                  text: `🔗 АРЕШТ ЗАВЕРШЕНО! [${evt.npcName}] затримано в наручники! Премія: +₴${evt.reward}`,
                  type: 'arrest'
                });
                setTimeout(() => setCombatBanner(null), 3500);
              } else if (evt.type === 'cannot_arrest_innocent') {
                playAccessDeniedSound();
                setCombatBanner({
                  text: `⚠️ [${evt.npcName}] не порушує правопорядок! Заарештовуйте лише дебоширів або оглушених!`,
                  type: 'warning'
                });
                setTimeout(() => setCombatBanner(null), 3000);
              } else if (evt.type === 'police_tasered_player') {
                setHumanHealth(prevHp => Math.max(0, prevHp - evt.damage));
                setCombatBanner({
                  text: `🚨 ${evt.officerName} ЗНЕШКОДИВ ВАС ТАЙЗЕРОМ ЗА БІЙКУ! (-${evt.damage}% HP)`,
                  type: 'hurt'
                });
                setTimeout(() => setCombatBanner(null), 3000);
              } else if (evt.type === 'player_punched_npc') {
                setCombatBanner({
                  text: `👊 УДАР! Нанесено ${evt.damage} шкоди [${evt.npcName}]!`,
                  type: 'punch'
                });
                setTimeout(() => setCombatBanner(null), 2000);
              } else if (evt.type === 'npc_hit_player') {
                setHumanHealth(prevHp => Math.max(0, prevHp - evt.damage));
                setCombatBanner({
                  text: `💥 ${evt.npcName} ВДАРИВ ВАС! (-${evt.damage}% HP)`,
                  type: 'hurt'
                });
                setTimeout(() => setCombatBanner(null), 2500);
              } else if (evt.type === 'npc_knocked_out') {
                setCombatBanner({
                  text: `🏆 НОКАУТ! ${evt.npcName} знепритомнів! Випали гроші!`,
                  type: 'knockout'
                });
                setTimeout(() => setCombatBanner(null), 3000);
              } else if (evt.type === 'picked_up_cash') {
                setPlayerMoney(prev => prev + evt.amount);
                setCombatBanner({
                  text: `💵 +₴${evt.amount} (Підібрано готівку)`,
                  type: 'cash'
                });
                setTimeout(() => setCombatBanner(null), 2500);
              }
            });
          }

          // Camera Follow Human
          updateDriveCamera(camera, builder.carGroup, p, cameraMode, true, humanRef.current);

          // Engine idle audio
          dynamicAudio.update(800, 0, false, false);

          // Telemetry
          setTelemetry({
            speedKmh: humanState.speedKmh,
            rpm: 800,
            gear: '🚶',
            driftScore: 0,
            isDrifting: false,
            health: humanHealth,
            carX: humanState.x,
            carZ: humanState.z,
            isAutopilot: false,
            autopilotTarget: null,
            autopilotIdx: 0,
            autopilotRoute: [],
            routeCompleted: false,
            destruction: {}
          });
        }
      } else {
        // Hide car interaction ring while driving
        carGlowRing.visible = false;
        // ================= VEHICLE DRIVING MODE =================
        // Auto-Forward mode (Key V: vehicle automatically drives forward, player steers)
        if (isAutoForwardRef.current) {
          keysRef.current.throttle = !keysRef.current.brake;
        }

        // Update vehicle physics with colliders
        const p = physicsRef.current.update(keysRef.current, dt, collidersRef.current);

        // Check proximity to supermarket entrance
        const foundStore = supermarketsRef.current?.find(
          s => Math.hypot(p.x - s.entranceX, p.z - s.entranceZ) < s.radius + 3
        );
        setNearStore(foundStore || null);

        // Check proximity to buyable housing property
        const foundHousing = housingListRef.current?.find(
          h => Math.hypot(p.x - h.entranceX, p.z - h.entranceZ) < h.radius + 3
        );
        setNearHousing(foundHousing || null);

        // Check proximity to Gun Shop
        const foundGunShop = gunShopsRef.current?.find(
          g => Math.hypot(p.x - g.entranceX, p.z - g.entranceZ) < (g.radius || 4.5) + 3
        );
        setNearGunShop(foundGunShop || null);

        // Check parking lot occupancy
        const foundLot = parkingHubsRef.current?.find(
          lot => Math.abs(p.x - lot.x) < lot.width / 2 && Math.abs(p.z - lot.z) < lot.depth / 2
        );
        setCurrentParkingLot(foundLot ? foundLot.name : null);

        // Hunger drain while driving
        setHumanHunger(prevH => {
          const nextH = Math.max(0, prevH - 0.08 * dt);
          if (nextH === 0) {
            setHumanHealth(prevHp => Math.max(0, prevHp - 0.8 * dt));
          }
          return nextH;
        });

        // Traffic bots interaction with player car
        const trafficRes = trafficSystemRef.current?.update(
          dt,
          { x: p.x, z: p.z, yaw: p.yaw, speedKmh: p.speedKmh },
          { x: 0, z: 0 },
          false
        );

        if (trafficRes?.trafficCrashEvent) {
          physicsRef.current.applyImpact(trafficRes.trafficCrashEvent.force, trafficRes.trafficCrashEvent.botName);
        }

        // Pedestrian NPC interaction with player car
        pedestrianSystemRef.current?.update(
          dt,
          null,
          { x: p.x, z: p.z, yaw: p.yaw, speedKmh: p.speedKmh },
          false,
          camera
        );

        // Tesla FSD Ribbon Path Update along active route
        if (p.isAutopilot && p.autopilotRoute && p.autopilotRoute.length > 0) {
          pathLine.visible = true;
          const pos = pathGeo.attributes.position.array;
          const r = p.autopilotRoute;
          const startIdx = p.autopilotIdx || 0;
          let pt = 0;

          pos[0] = p.x;
          pos[1] = 0.25;
          pos[2] = p.z;
          pt++;

          for (let i = startIdx; i < r.length && pt < maxPathPoints; i++) {
            const wp = r[i];
            pos[pt * 3] = wp.x;
            pos[pt * 3 + 1] = 0.25;
            pos[pt * 3 + 2] = wp.z;
            pt++;
          }
          for (let i = pt; i < maxPathPoints; i++) {
            pos[i * 3] = pos[(pt - 1) * 3];
            pos[i * 3 + 1] = 0.25;
            pos[i * 3 + 2] = pos[(pt - 1) * 3 + 2];
          }
          pathGeo.attributes.position.needsUpdate = true;
        } else {
          pathLine.visible = false;
        }

        // Handle Crash & Destruction Events
        if (p.lastCrash) {
          if (p.lastCrash.isTotalWreck && !hasPlayedWreckSound.current) {
            playTotalWreckSound();
            hasPlayedWreckSound.current = true;
          } else {
            playCrashSound(p.lastCrash.force);
          }

          screenShakeRef.current = 0;

          setCrashBanner({
            name: p.lastCrash.isTotalWreck ? '💥 ТОТАЛЬНЕ ЗНИЩЕННЯ АВТО!' : p.lastCrash.objectName,
            force: p.lastCrash.force,
            isTotalWreck: p.lastCrash.isTotalWreck,
            isFsd: false
          });
          setTimeout(() => setCrashBanner(null), 3000);

          // Scatter Flying 3D Debris Chunks across the road!
          const debrisToScatter = Math.min(debrisCount, Math.round(p.lastCrash.force * 0.8) + 4);
          for (let i = 0; i < debrisToScatter; i++) {
            const deb = debrisList[i];
            deb.visible = true;
            deb.position.set(p.x + (Math.random() - 0.5) * 1.0, 0.4, p.z + (Math.random() - 0.5) * 1.0);
            const angle = Math.random() * Math.PI * 2;
            const speed = (p.lastCrash.force * 0.35) + Math.random() * 8;
            deb.vx = Math.sin(angle) * speed;
            deb.vy = 3 + Math.random() * 6; // burst upwards
            deb.vz = Math.cos(angle) * speed;
            deb.rotVx = (Math.random() - 0.5) * 15;
            deb.rotVy = (Math.random() - 0.5) * 15;
          }

          // Sparks
          sparkMat.opacity = 1.0;
          const pos = sparkGeo.attributes.position.array;
          for (let i = 0; i < sparkCount; i++) {
            pos[i * 3] = p.x + (Math.random() - 0.5) * 1.8;
            pos[i * 3 + 1] = 0.5 + Math.random() * 1.5;
            pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 1.8;
          }
          sparkGeo.attributes.position.needsUpdate = true;
        }

        // Visual Car Mesh Smashing Deformation
        if (builder.carGroup) {
          const dmg = p.damageLevel;
          builder.carGroup.scale.z = Math.max(0.78, 1 - dmg * 0.18);
          builder.carGroup.scale.y = 1 + dmg * 0.05;
          builder.carGroup.rotation.z = 0;
        }

        // Update 3D car position & orientation
        const carGroup = builder.carGroup;
        carGroup.position.set(p.x, 0, p.z);
        carGroup.rotation.y = p.yaw;

        // Front wheels steering angle
        if (builder.wheels && builder.wheels.length >= 2) {
          builder.wheels[0].rotation.y = p.steeringAngle;
          builder.wheels[1].rotation.y = p.steeringAngle;
        }

        // Wheels rotation with speed
        const rollSpeed = p.speedKmh * 0.05;
        builder.wheels.forEach(w => {
          w.children[0].rotation.x += rollSpeed;
        });

        // Dynamic engine audio
        dynamicAudio.update(p.rpm, p.speedKmh, keysRef.current.throttle, p.isDrifting);

        // Animate Rooftop Police Strobe Lightbar
        if (isDrivingPoliceCarRef.current) {
          policeStrobeBar.visible = true;
          if (isSirenOnRef.current) {
            const flash = Math.sin(now * 0.02) > 0;
            strobeBlueLight.intensity = flash ? 3.5 : 0;
            strobeRedLight.intensity = flash ? 0 : 3.5;
            strobeBlueMesh.material.emissiveIntensity = flash ? 3.5 : 0.3;
            strobeRedMesh.material.emissiveIntensity = flash ? 0.3 : 3.5;
          } else {
            strobeBlueLight.intensity = 0.4;
            strobeRedLight.intensity = 0.4;
            strobeBlueMesh.material.emissiveIntensity = 1.0;
            strobeRedMesh.material.emissiveIntensity = 1.0;
          }
        } else {
          policeStrobeBar.visible = false;
          strobeBlueLight.intensity = 0;
          strobeRedLight.intensity = 0;
        }

        // Synchronize custom vehicle 3D models (Tank, Kozak-2M AA, Police Car)
        if (isDrivingTankRef.current) {
          if (builder.carGroup) builder.carGroup.visible = false;
          if (militaryBaseRef.current?.tank?.group) {
            militaryBaseRef.current.tank.group.position.set(p.x, 0, p.z);
            militaryBaseRef.current.tank.group.rotation.y = p.yaw + Math.PI / 2;
            militaryBaseRef.current.tank.group.visible = true;
          }
        } else if (isDrivingMilitaryCarRef.current) {
          if (builder.carGroup) builder.carGroup.visible = false;
          if (militaryBaseRef.current?.militaryCar?.group) {
            militaryBaseRef.current.militaryCar.group.position.set(p.x, 0, p.z);
            militaryBaseRef.current.militaryCar.group.rotation.y = p.yaw - Math.PI / 2;
            militaryBaseRef.current.militaryCar.group.visible = true;
          }
        } else {
          if (builder.carGroup) builder.carGroup.visible = true;
        }

        // Camera Follow Car
        updateDriveCamera(camera, carGroup, p, cameraMode, false, null);

        // Telemetry update
        setTelemetry({
          speedKmh: p.speedKmh,
          rpm: p.rpm,
          gear: p.gear,
          driftScore: p.driftScore,
          isDrifting: p.isDrifting,
          health: p.health,
          carX: p.x,
          carZ: p.z,
          isAutopilot: p.isAutopilot,
          autopilotTarget: p.autopilotTarget,
          autopilotIdx: p.autopilotIdx,
          autopilotRoute: p.autopilotRoute,
          routeCompleted: p.routeCompleted,
          destruction: p.destruction
        });

        // Check proximity to Military Base when driving in car
        if (militaryBaseRef.current) {
          const mb = militaryBaseRef.current;
          const distToBase = Math.hypot(p.x - mb.entranceX, p.z - mb.entranceZ);
          const distToTank = mb.tank ? Math.hypot(p.x - mb.tank.x, p.z - mb.tank.z) : 999;
          const distToMilCar = mb.militaryCar ? Math.hypot(p.x - mb.militaryCar.x, p.z - mb.militaryCar.z) : 999;
          setNearMilitaryBase(distToBase < (mb.radius || 15.0) || distToTank < 12.0 || distToMilCar < 12.0);
        } else {
          setNearMilitaryBase(false);
        }
      }

      // Cooldown decrement for heavy tank cannon
      if (tankCannonCooldownRef.current > 0) {
        tankCannonCooldownRef.current = Math.max(0, tankCannonCooldownRef.current - dt);
      }

      // Update Air Defense System (Shahed flight, siren, FPV drone, collisions)
      const currentPos = isHumanOnFootRef.current
        ? { x: humanRef.current?.x || 0, y: 0, z: humanRef.current?.z || 0 }
        : { x: physicsRef.current?.x || 0, y: 0, z: physicsRef.current?.z || 0 };
      const airEvents = airDefenseRef.current?.update(dt, keysRef.current, currentPos);

      if (airEvents && airEvents.length > 0) {
        airEvents.forEach(evt => {
          if (evt.type === 'alarm_started') {
            setIsAlarmActive(true);
          } else if (evt.type === 'alarm_ended') {
            setIsAlarmActive(false);
          } else if (evt.type === 'building_impact') {
            setCrashBanner({
              name: `🔥 ПРИЛІТ ШАХЕДА У [${evt.targetName}]! Будівля палає! ДСНС 101 виїхали на місце!`,
              force: 25,
              isFsd: false
            });
            setTimeout(() => setCrashBanner(null), 5000);
          } else if (evt.type === 'fpv_interception_kill') {
            setShahedKills(k => k + 1);
            setPlayerMoney(m => m + 500);
            setCrashBanner({
              name: '💥 FPV-ТАРАН! Шахед знищено прямим влучанням дрона-камікадзе! (+₴500)',
              force: 0,
              isFsd: true
            });
            setTimeout(() => setCrashBanner(null), 4000);
          }
        });
      }

      // Camera Follow FPV Drone if active
      if (airDefenseRef.current?.isFpvActive && airDefenseRef.current?.fpvDrone) {
        const drone = airDefenseRef.current.fpvDrone;
        camera.position.set(drone.x, drone.y + 0.15, drone.z);
        camera.rotation.y = drone.yaw;
        camera.lookAt(
          drone.x - Math.sin(drone.yaw) * 12,
          drone.y + 0.15 + (drone.pitch || 0) * 8,
          drone.z - Math.cos(drone.yaw) * 12
        );
      }

      // Update 3D Flying Debris Physics (Gravity & Floor Bounce)
      debrisList.forEach(deb => {
        if (deb.visible) {
          deb.position.x += deb.vx * dt;
          deb.position.y += deb.vy * dt;
          deb.position.z += deb.vz * dt;
          deb.vy -= 9.8 * 1.5 * dt;

          deb.rotation.x += deb.rotVx * dt;
          deb.rotation.y += deb.rotVy * dt;

          if (deb.position.y < 0.08) {
            deb.position.y = 0.08;
            deb.vy = -deb.vy * 0.35; // bounce damping
            deb.vx *= 0.82;
            deb.vz *= 0.82;
          }
        }
      });

      // Update 3D Remote Players (Interpolation & Visual Animations)
      remotePlayerRendererRef.current?.update(dt);

      // Periodically broadcast local player's position, vehicle, weapon & state (25Hz)
      if (now - lastNetworkSyncTime.current > 40) {
        lastNetworkSyncTime.current = now;
        const myX = isHumanOnFootRef.current ? (humanRef.current?.x || 0) : p.x;
        const myZ = isHumanOnFootRef.current ? (humanRef.current?.z || 0) : p.z;
        const myYaw = isHumanOnFootRef.current ? (humanRef.current?.yaw || 0) : p.yaw;
        const mySpeed = isHumanOnFootRef.current ? (humanRef.current?.speedKmh || 0) : p.speedKmh;

        multiplayerManagerRef.current?.broadcastState({
          x: myX,
          y: 0,
          z: myZ,
          yaw: myYaw,
          speedKmh: mySpeed,
          isHumanOnFoot: isHumanOnFootRef.current,
          isDrivingTank: isDrivingTankRef.current,
          isDrivingMilitaryCar: isDrivingMilitaryCarRef.current,
          isDrivingPoliceCar: isDrivingPoliceCarRef.current,
          role: isArmyRef.current ? 'army' : isPoliceRef.current ? 'police' : 'civilian',
          equippedWeapon: equippedWeapon,
          hp: humanHealth,
          carConfig: carConfig,
          shahedKills: shahedKills,
          money: playerMoney
        });
      }

      // Update Engine Smoke & Fire particles
      const pCurrent = physicsRef.current;
      if (pCurrent.destruction?.isSmoking || pCurrent.destruction?.isFire) {
        smokeMat.opacity = Math.min(0.85, (100 - pCurrent.health) / 100);
        smokeMat.color.setHex(pCurrent.destruction.isFire ? 0xef4444 : 0x334155);

        const sPos = smokeGeo.attributes.position.array;
        for (let i = 0; i < smokeCount; i++) {
          sPos[i * 3] = pCurrent.x + (Math.random() - 0.5) * 0.8;
          sPos[i * 3 + 1] = 0.8 + (i / smokeCount) * 2.4;
          sPos[i * 3 + 2] = pCurrent.z + 1.2 + (Math.random() - 0.5) * 0.8;
        }
        smokeGeo.attributes.position.needsUpdate = true;

        if (pCurrent.destruction.isFire) {
          engineFireLight.intensity = 2.5 + Math.random() * 2.5;
          engineFireLight.position.set(pCurrent.x, 0.8, pCurrent.z + 1.2);
        }
      } else {
        smokeMat.opacity = 0;
        engineFireLight.intensity = 0;
      }

      // Fade sparks
      if (sparkMat.opacity > 0) {
        sparkMat.opacity -= dt * 2.5;
      }

      // Hospital Emergency Check if health depleted
      setHumanHealth(currHp => {
        if (currHp <= 0) {
          setHumanHunger(65);
          setPlayerMoney(m => Math.max(0, m - 150));
          const respX = selectedCity === 'zaporizhzhia' ? 120 : 0;
          const respZ = selectedCity === 'zaporizhzhia' ? -100 : selectedCity === 'kyiv' ? -10 : -5;
          if (isHumanOnFootRef.current && humanRef.current) {
            humanRef.current.spawn(respX, respZ, 0);
          } else {
            physicsRef.current.resetPosition(respX, respZ, 0);
          }
          setCrashBanner({
            name: "🏥 ВАС ДОСТАВИЛИ ДО МІСЬКОЇ ЛІКАРНІ! (Лікування: -₴150, Здоров'я відновлено)",
            force: 0,
            isFsd: true
          });
          setTimeout(() => setCrashBanner(null), 4000);
          return 100;
        }
        return currHp;
      });

      renderer.render(scene, camera);
    };
    animationFrameId = requestAnimationFrame(loop);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      trafficSystemRef.current?.destroy();
      humanRef.current?.destroy();
      pedestrianSystemRef.current?.destroy();
      interiorRoomRef.current?.destroy();
      airDefenseRef.current?.destroy();
      multiplayerManagerRef.current?.destroy();
      remotePlayerRendererRef.current?.destroy();
      dynamicAudio.stop();
      stopPoliceSiren();
      stopAirRaidSiren();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [cameraMode]);

  // Human character exit/enter vehicle
  const handleToggleExitEnterCar = () => {
    // Reset control keys
    keysRef.current = { throttle: false, brake: false, steerLeft: false, steerRight: false, handbrake: false };

    if (isHumanOnFootRef.current) {
      const p = physicsRef.current;
      const human = humanRef.current;
      if (!human) return;

      // 1. Entering dedicated Police Patrol Car at the police department
      if (nearPoliceCarRef.current) {
        if (!isPoliceRef.current) {
          playAccessDeniedSound();
          setCrashBanner({
            name: '⛔ ДОСТУП ЗАБОРОНЕНО: Тільки для офіцерів Національної Поліції! Вступіть до лав поліції у відділку [F]',
            force: 0,
            isFsd: true
          });
          setTimeout(() => setCrashBanner(null), 3500);
          return;
        }

        // Officer is authorized: enter police car
        const ps = policeStationRef.current;
        const targetX = ps?.policeCar ? ps.policeCar.x : p.x;
        const targetZ = ps?.policeCar ? ps.policeCar.z : p.z;
        const targetYaw = ps?.policeCar ? ps.policeCar.yaw : p.yaw;

        p.x = targetX;
        p.z = targetZ;
        p.yaw = targetYaw;
        p.speed = 0;
        p.steeringAngle = 0;

        playDoorSound();
        playPoliceRadioSound();
        human.despawn();
        setIsHumanOnFoot(false);
        isHumanOnFootRef.current = false;
        setIsDrivingPoliceCar(true);
        isDrivingPoliceCarRef.current = true;
        setIsDrivingTank(false);
        isDrivingTankRef.current = false;
        setIsDrivingMilitaryCar(false);
        isDrivingMilitaryCarRef.current = false;
        setCanEnterCar(false);
        setNearPoliceCar(false);

        setCrashBanner({
          name: '🚓 ВИ СІЛИ В ПАТРУЛЬНЕ АВТО 102! [G] — Сирена та спецсигнали',
          force: 0,
          isFsd: true
        });
        setTimeout(() => setCrashBanner(null), 3000);
        return;
      }

      // 1b. Entering dedicated ZSU Main Battle Tank T-64BV
      if (nearTankRef.current) {
        if (!isArmyRef.current) {
          playAccessDeniedSound();
          setCrashBanner({
            name: '⛔ ТІЛЬКИ ДЛЯ АРМІЇ ЗСУ 🔒: Вступіть до лав ЗСУ у штабі військової частини [F]!',
            force: 0,
            isFsd: true
          });
          setTimeout(() => setCrashBanner(null), 3500);
          return;
        }

        const mb = militaryBaseRef.current;
        const targetX = mb?.tank ? mb.tank.x : p.x;
        const targetZ = mb?.tank ? mb.tank.z : p.z;
        const targetYaw = mb?.tank ? mb.tank.yaw : p.yaw;

        p.x = targetX;
        p.z = targetZ;
        p.yaw = targetYaw;
        p.speed = 0;
        p.steeringAngle = 0;

        playDoorSound();
        playGunCockSound();
        human.despawn();
        setIsHumanOnFoot(false);
        isHumanOnFootRef.current = false;
        setIsDrivingTank(true);
        isDrivingTankRef.current = true;
        setIsDrivingMilitaryCar(false);
        isDrivingMilitaryCarRef.current = false;
        setIsDrivingPoliceCar(false);
        isDrivingPoliceCarRef.current = false;
        setCanEnterCar(false);
        setNearTank(false);

        setCrashBanner({
          name: '🛡️ ВИ СІЛИ В ТАНК ЗСУ Т-64БВ! [Space] або [Q] — Постріл 125мм гармати',
          force: 0,
          isFsd: true
        });
        setTimeout(() => setCrashBanner(null), 4000);
        return;
      }

      // 1c. Entering dedicated ZSU Combat Armor «Kozak-2M»
      if (nearMilitaryCarRef.current) {
        if (!isArmyRef.current) {
          playAccessDeniedSound();
          setCrashBanner({
            name: '⛔ ТІЛЬКИ ДЛЯ АРМІЇ ЗСУ 🔒: Вступіть до лав ЗСУ у штабі військової частини [F]!',
            force: 0,
            isFsd: true
          });
          setTimeout(() => setCrashBanner(null), 3500);
          return;
        }

        const mb = militaryBaseRef.current;
        const targetX = mb?.militaryCar ? mb.militaryCar.x : p.x;
        const targetZ = mb?.militaryCar ? mb.militaryCar.z : p.z;
        const targetYaw = mb?.militaryCar ? mb.militaryCar.yaw : p.yaw;

        p.x = targetX;
        p.z = targetZ;
        p.yaw = targetYaw;
        p.speed = 0;
        p.steeringAngle = 0;

        playDoorSound();
        playGunCockSound();
        human.despawn();
        setIsHumanOnFoot(false);
        isHumanOnFootRef.current = false;
        setIsDrivingMilitaryCar(true);
        isDrivingMilitaryCarRef.current = true;
        setIsDrivingTank(false);
        isDrivingTankRef.current = false;
        setIsDrivingPoliceCar(false);
        isDrivingPoliceCarRef.current = false;
        setCanEnterCar(false);
        setNearMilitaryCar(false);

        setCrashBanner({
          name: '⚡ ВИ СІЛИ В БРОНЕВИК ППО «КОЗАК-2М»! [Space] або [Q] — Зенітна турель',
          force: 0,
          isFsd: true
        });
        setTimeout(() => setCrashBanner(null), 4000);
        return;
      }

      // 2. Entering player's standard vehicle
      const carGroup = carBuilderRef.current?.carGroup;
      const targetX = carGroup ? carGroup.position.x : p.x;
      const targetZ = carGroup ? carGroup.position.z : p.z;
      const dist = Math.hypot(targetX - human.x, targetZ - human.z);
      const distPhys = Math.hypot(p.x - human.x, p.z - human.z);
      const effectiveDist = Math.min(dist, distPhys);

      if (effectiveDist < 8.0) {
        // Guarantee synchronization: lock vehicle at visual position
        p.x = targetX;
        p.z = targetZ;
        p.speed = 0;
        p.steeringAngle = 0;

        playDoorSound();
        human.despawn();
        setIsHumanOnFoot(false);
        isHumanOnFootRef.current = false;
        setIsDrivingPoliceCar(false);
        isDrivingPoliceCarRef.current = false;
        setIsDrivingTank(false);
        isDrivingTankRef.current = false;
        setIsDrivingMilitaryCar(false);
        isDrivingMilitaryCarRef.current = false;
        setCanEnterCar(false);
        setCrashBanner({
          name: '🚗 ВИ СІЛИ В АВТОМОБІЛЬ',
          force: 0,
          isFsd: true
        });
        setTimeout(() => setCrashBanner(null), 2500);
      } else {
        setCrashBanner({
          name: `⚠️ ПІДІЙДІТЬ БЛИЖЧЕ ДО АВТОМОБІЛЯ! (Відстань: ${effectiveDist.toFixed(1)}м, потрібно < 8м)`,
          force: 0,
          isFsd: true
        });
        setTimeout(() => setCrashBanner(null), 2500);
      }
    } else {
      const p = physicsRef.current;
      const currentSpeedKmh = Math.abs((p.speed || 0) * 3.6);
      if (currentSpeedKmh > 12) {
        setCrashBanner({
          name: '🛑 СПОЧАТКУ ЗУПИНІТЬ АВТОМОБІЛЬ, ЩОБ ВИЙТИ!',
          force: 0,
          isFsd: true
        });
        setTimeout(() => setCrashBanner(null), 2000);
        return;
      }
      playDoorSound();
      if (isSirenOnRef.current) {
        stopPoliceSiren();
        setIsSirenOn(false);
        isSirenOnRef.current = false;
      }
      setIsDrivingPoliceCar(false);
      isDrivingPoliceCarRef.current = false;
      setIsDrivingTank(false);
      isDrivingTankRef.current = false;
      setIsDrivingMilitaryCar(false);
      isDrivingMilitaryCarRef.current = false;
      p.speed = 0;
      p.steeringAngle = 0;

      const spawnX = p.x - Math.cos(p.yaw) * 2.2;
      const spawnZ = p.z + Math.sin(p.yaw) * 2.2;
      if (humanRef.current) {
        humanRef.current.spawn(spawnX, spawnZ, p.yaw);
      }
      setIsHumanOnFoot(true);
      isHumanOnFootRef.current = true;
      setCanEnterCar(true);

      if (p.isAutopilot) {
        p.toggleAutopilot();
        setIsAutopilot(false);
      }
      isAutoForwardRef.current = false;
      setIsAutoForward(false);

      setCrashBanner({
        name: '🚶 РЕЖИМ ЛЮДИНИ: W/A/S/D — рух • Space/Shift — біг • [E] — сісти в авто • 1-4 — зброя',
        force: 0,
        isFsd: true
      });
      setTimeout(() => setCrashBanner(null), 3500);
    }
  };
  exitEnterCarRef.current = handleToggleExitEnterCar;

  // Open supermarket
  const handleOpenStore = () => {
    if (nearStoreRef.current || nearStore) {
      playClickSound();
      setActiveStore(nearStoreRef.current || nearStore);
    }
  };
  openStoreRef.current = handleOpenStore;

  // Open housing property modal
  const handleOpenHousing = () => {
    if (nearHousingRef.current || nearHousing) {
      playClickSound();
      setActiveHousing(nearHousingRef.current || nearHousing);
    }
  };
  openHousingRef.current = handleOpenHousing;

  // Open police department headquarters modal
  const handleOpenPoliceStation = () => {
    if (nearPoliceStationRef.current || nearPoliceStation) {
      playClickSound();
      setActivePoliceStation(true);
    }
  };
  openPoliceStationRef.current = handleOpenPoliceStation;

  // Buy property handler (₴100)
  const handleBuyProperty = (property) => {
    if (playerMoney < property.price) {
      return false;
    }
    setPlayerMoney(prev => prev - property.price);
    setOwnedProperties(prev => {
      if (prev.includes(property.id)) return prev;
      return [...prev, property.id];
    });
    setCrashBanner({
      name: `🎉 ВІТАЄМО З НОВОСІЛЛЯМ! Ви придбали «${property.name}» за ₴${property.price}!`,
      force: 0,
      isFsd: true
    });
    setTimeout(() => setCrashBanner(null), 4000);
    return true;
  };

  // Park vehicle at home
  const handleParkCarAtHome = (property) => {
    playDoorSound();
    if (physicsRef.current) {
      const parkX = property.parkingX || property.entranceX;
      const parkZ = property.parkingZ || property.entranceZ;
      physicsRef.current.resetPosition(parkX, parkZ, 0);
      if (isHumanOnFoot && humanRef.current) {
        humanRef.current.spawn(property.entranceX, property.entranceZ, 0);
      }
      setCrashBanner({
        name: `🚗 Авто запарковано на вашому паркінгу: «${property.name}»`,
        force: 0,
        isFsd: true
      });
      setTimeout(() => setCrashBanner(null), 3000);
    }
  };

  // Autopilot toggle (Full Autonomous Path Following - Key F)
  const toggleAutopilot = () => {
    const active = physicsRef.current.toggleAutopilot();
    playTeslaAutopilotSound(active);
    setIsAutopilot(active);
    if (active) {
      isAutoForwardRef.current = false;
      setIsAutoForward(false);
    }
    const brandTitle = getAutopilotBrandName(carConfig.modelId);
    setCrashBanner({
      name: active ? `⚡ ${brandTitle} АКТИВОВАНО` : '⏸️ АВТОПІЛОТ ДЕАКТИВОВАНО',
      force: 0,
      isFsd: true
    });
    setTimeout(() => setCrashBanner(null), 3000);
  };
  toggleAutopilotRef.current = toggleAutopilot;

  // Auto-Forward toggle (Key V: vehicle automatically drives forward, player steers)
  const toggleAutoForward = () => {
    playClickSound();
    const nextState = !isAutoForwardRef.current;
    isAutoForwardRef.current = nextState;
    setIsAutoForward(nextState);
    if (nextState) {
      if (physicsRef.current && physicsRef.current.isAutopilot) {
        physicsRef.current.toggleAutopilot();
        setIsAutopilot(false);
      }
      setCrashBanner({
        name: '🚀 АВТО-ТЯГА [V] УВІМКНЕНО (Тільки рулюйте A/D!)',
        force: 0,
        isFsd: true
      });
    } else {
      setCrashBanner({
        name: '⏸️ АВТО-ТЯГУ [V] ВИМКНЕНО (Ручний газ)',
        force: 0,
        isFsd: true
      });
    }
    setTimeout(() => setCrashBanner(null), 3000);
  };
  toggleAutoForwardRef.current = toggleAutoForward;

  // Speed Limit Handler (50, 100, 200, 300, or null)
  const handleSetSpeedLimit = (limit) => {
    playClickSound();
    setSpeedLimit(limit);
    if (physicsRef.current) {
      physicsRef.current.setSpeedLimit(limit);
    }
    setCrashBanner({
      name: limit ? `🎯 МАКС. ШВИДКІСТЬ: ${limit} КМ/ГОД` : '🚀 ЗНЯТО ОБМЕЖЕННЯ (ПОВНА ПОТУЖНІСТЬ)',
      force: 0,
      isFsd: true
    });
    setTimeout(() => setCrashBanner(null), 2500);
  };
  setSpeedLimitRef.current = handleSetSpeedLimit;

  // Toggle Camera
  const toggleCamera = () => {
    playClickSound();
    setCameraMode(prev => (prev === 'chase' ? 'cockpit' : prev === 'cockpit' ? 'top' : 'chase'));
  };
  toggleCameraRef.current = toggleCamera;

  // Repair
  const handleRepair = () => {
    playRepairSound();
    hasPlayedWreckSound.current = false;
    physicsRef.current.repair();
    if (carBuilderRef.current) {
      carBuilderRef.current.carGroup.scale.set(1, 1, 1);
      carBuilderRef.current.carGroup.rotation.z = 0;
    }
  };

  // City Switcher (Vinnytsia / Zaporizhzhia)
  const handleSelectCity = (cityId) => {
    if (cityId === selectedCity) return;
    playClickSound();
    setSelectedCity(cityId);

    const cityGroup = cityGroupRef.current;
    if (cityGroup && physicsRef.current) {
      while (cityGroup.children.length > 0) {
        cityGroup.remove(cityGroup.children[0]);
      }
      if (cityId === 'kyiv') {
        collidersRef.current = buildKyivCity(cityGroup);
        physicsRef.current.resetPosition(0, -10, 0);
        physicsRef.current.setRoute(DEFAULT_KYIV_ROUTE);
        setCustomRoute(DEFAULT_KYIV_ROUTE);
        setCrashBanner({
          name: '🏛️ ВІТАЄМО В СТОЛИЦІ — МІСТО КИЇВ! (ХРЕЩАТИК • МАЙДАН • ДНІПРО • ЗОЛОТІ ВОРОТА)',
          force: 0,
          isFsd: true
        });
      } else if (cityId === 'zaporizhzhia') {
        collidersRef.current = buildZaporizhzhiaCity(cityGroup);
        physicsRef.current.resetPosition(120, -100, Math.PI);
        physicsRef.current.setRoute(DEFAULT_ZAPORIZHZHIA_ROUTE);
        setCustomRoute(DEFAULT_ZAPORIZHZHIA_ROUTE);
        setCrashBanner({
          name: '🌊 ВІТАЄМО В ЗАПОРІЖЖІ! (ДНІПРОГЕС • ХОРТИЦЯ • СІЧ)',
          force: 0,
          isFsd: true
        });
      } else {
        collidersRef.current = buildVinnytsiaCity(cityGroup);
        physicsRef.current.resetPosition(0, -5, 0);
        physicsRef.current.setRoute(DEFAULT_AUTOPILOT_ROUTE);
        setCustomRoute(DEFAULT_AUTOPILOT_ROUTE);
        setCrashBanner({
          name: '🏙️ ВІТАЄМО У ВІННИЦІ! (ВЕЖА • РОШЕН • СОБОРНА)',
          force: 0,
          isFsd: true
        });
      }

      // Rebuild amenities for new city
      const amenities = setupCityAmenities(cityGroup, cityId, collidersRef.current);
      supermarketsRef.current = amenities.supermarkets;
      parkingHubsRef.current = amenities.parkingHubs;
      housingListRef.current = amenities.housingProperties || [];
      setHousingProperties(amenities.housingProperties || []);
      policeStationRef.current = amenities.policeStation || null;
      gunShopsRef.current = amenities.gunShops || [];
      dsnsStationsRef.current = amenities.dsnsStations || [];
      militaryBaseRef.current = amenities.militaryBase || null;
      setNearHousing(null);
      setActiveHousing(null);
      setNearPoliceStation(false);
      setActivePoliceStation(false);
      setNearPoliceCar(false);
      setNearGunShop(null);
      setActiveGunShop(null);
      setNearMilitaryBase(false);
      setActiveMilitaryBase(false);
      setNearTank(false);
      setIsDrivingTank(false);
      isDrivingTankRef.current = false;
      setNearMilitaryCar(false);
      setIsDrivingMilitaryCar(false);
      isDrivingMilitaryCarRef.current = false;
      if (isSirenOnRef.current) {
        stopPoliceSiren();
        setIsSirenOn(false);
        isSirenOnRef.current = false;
      }
      setIsDrivingPoliceCar(false);
      isDrivingPoliceCarRef.current = false;

      // Recreate traffic bots for new city
      if (trafficSystemRef.current) {
        trafficSystemRef.current.destroy();
      }
      if (sceneRef.current) {
        trafficSystemRef.current = new TrafficSystem(sceneRef.current, cityId);
      }

      // Recreate pedestrian NPCs for new city
      if (pedestrianSystemRef.current) {
        pedestrianSystemRef.current.destroy();
      }
      if (sceneRef.current) {
        pedestrianSystemRef.current = new PedestrianSystem(sceneRef.current, cityId);
      }

      // If inside interior, exit back to car
      if (activeInteriorRef.current && exitInteriorRef.current) {
        exitInteriorRef.current();
      }

      // If human character was out, despawn and return inside car
      if (humanRef.current && isHumanOnFoot) {
        humanRef.current.despawn();
        setIsHumanOnFoot(false);
        setCanEnterCar(false);
      }

      setTimeout(() => setCrashBanner(null), 3500);
    }
  };

  // Reset Car
  const handleResetCar = () => {
    playClickSound();
    if (selectedCity === 'zaporizhzhia') {
      physicsRef.current.resetPosition(120, -100, Math.PI);
    } else if (selectedCity === 'kyiv') {
      physicsRef.current.resetPosition(0, -10, 0);
    } else {
      physicsRef.current.resetPosition(0, -5, 0);
    }
    hasPlayedWreckSound.current = false;
    if (carBuilderRef.current) {
      carBuilderRef.current.carGroup.scale.set(1, 1, 1);
      carBuilderRef.current.carGroup.rotation.z = 0;
    }
  };

  // Add waypoint to route planner from map click
  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert map canvas coords (-150 to +150 meters)
    const normX = (clickX / rect.width - 0.5) * 2;
    const normZ = (clickY / rect.height - 0.5) * 2;
    const worldX = Math.round(normX * 140);
    const worldZ = Math.round(normZ * 140);

    const newPt = {
      x: worldX,
      z: worldZ,
      name: `Точка (${worldX}, ${worldZ})`
    };
    const updated = [...customRoute, newPt];
    setCustomRoute(updated);
    physicsRef.current.setRoute(updated);
  };

  // Load Preset Route
  const loadPresetRoute = (preset) => {
    playClickSound();
    setCustomRoute(preset.waypoints);
    physicsRef.current.setRoute(preset.waypoints);
  };

  // Add Landmark to route
  const addLandmarkToRoute = (landmark) => {
    playClickSound();
    const updated = [...customRoute, { x: landmark.x, z: landmark.z, name: landmark.name }];
    setCustomRoute(updated);
    physicsRef.current.setRoute(updated);
  };

  // Remove waypoint
  const removeWaypoint = (idx) => {
    playClickSound();
    const updated = customRoute.filter((_, i) => i !== idx);
    setCustomRoute(updated);
    physicsRef.current.setRoute(updated);
  };

  // Clear route
  const handleClearRoute = () => {
    playClickSound();
    setCustomRoute([]);
    physicsRef.current.clearRoute();
  };

  // Open Gun Shop modal
  const handleOpenGunShop = () => {
    if (nearGunShopRef.current || nearGunShop) {
      playClickSound();
      setActiveGunShop(nearGunShopRef.current || nearGunShop);
    }
  };
  openGunShopRef.current = handleOpenGunShop;

  // Handle Weapon / Equipment Purchase in Gun Shop
  const handleBuyWeapon = (item) => {
    if (playerMoney < item.price) return false;
    setPlayerMoney(prev => prev - item.price);

    if (item.weaponKey) {
      setOwnedWeapons(prev => {
        const next = prev.includes(item.weaponKey) ? prev : [...prev, item.weaponKey];
        try {
          localStorage.setItem('pr5_owned_weapons', JSON.stringify(next));
        } catch {}
        return next;
      });
      playGunCockSound();
      handleEquipWeapon(item.weaponKey);
      setCrashBanner({
        name: `🔫 ПРИДБАНО: «${item.name}» за ₴${item.price}! Зброю споряджено!`,
        force: 0,
        isFsd: true
      });
    } else if (item.id === 'vest') {
      setHumanHealth(100);
      playGunCockSound();
      setCrashBanner({
        name: `🛡️ ПРИДБАНО: «${item.name}» за ₴${item.price}! Бронежилет надіто (+100% здоров'я)!`,
        force: 0,
        isFsd: true
      });
    } else if (item.id === 'ammo_box') {
      playGunCockSound();
      setCrashBanner({
        name: `📦 ПРИДБАНО: «${item.name}» за ₴${item.price}! Боєкомплект поповнено!`,
        force: 0,
        isFsd: true
      });
    }
    setTimeout(() => setCrashBanner(null), 3500);
    return true;
  };

  // Handle Emergency Calls via Smartphone (101 DSNS, 102 Police, 103 Ambulance)
  const handleEmergencyCall = (serviceId, optionId) => {
    if (serviceId === '101') {
      // DSNS 101 - Rescue and Firefighters
      playDsnsSirenSound();
      if (optionId === 'fire') {
        setTimeout(() => {
          playExtinguisherSound();
          if (physicsRef.current) {
            if (physicsRef.current.destruction) {
              physicsRef.current.destruction.isFire = false;
              physicsRef.current.destruction.isSmoking = false;
            }
            physicsRef.current.health = Math.max(physicsRef.current.health, 60);
          }
        }, 800);
        setCrashBanner({
          name: '🚒 ДСНС 101: «Пожежно-рятувальний розрахунок загасив вогонь авто вогнегасниками!»',
          force: 0,
          isFsd: true
        });
      } else if (optionId === 'medical') {
        setHumanHealth(100);
        setHumanHunger(prev => Math.max(prev, 75));
        setCrashBanner({
          name: "🚑 ДСНС/101: «Рятувальна медична група надала першу допомогу! Здоров'я 100%!»",
          force: 0,
          isFsd: true
        });
      } else if (optionId === 'rescue') {
        handleRepair();
        setCrashBanner({
          name: '🛠️ ДСНС 101: «Служба евакуації відбуксирувала та полагодила транспорт!»',
          force: 0,
          isFsd: true
        });
      }
      setTimeout(() => setCrashBanner(null), 4000);
    } else if (serviceId === '102') {
      // Police 102
      playPoliceRadioSound();
      if (optionId === 'join') {
        setActivePoliceStation(true);
        setIsPhoneOpen(false);
      } else if (optionId === 'report_fight') {
        setCrashBanner({
          name: '🚨 102 ПОЛІЦІЯ: «Виклик прийнято! Найближчий патруль прямує до вас, затримуйте правопорушників!»',
          force: 0,
          isFsd: true
        });
      } else if (optionId === 'car_theft' || optionId === 'escort') {
        setCrashBanner({
          name: '🚓 102 ПОЛІЦІЯ: «Орієнтування передано всім екіпажам міста!»',
          force: 0,
          isFsd: true
        });
      }
      setTimeout(() => setCrashBanner(null), 4000);
    } else if (serviceId === '103') {
      // Ambulance 103
      setHumanHealth(100);
      setHumanHunger(prev => Math.max(prev, 80));
      setCrashBanner({
        name: '🏥 103 ШВИДКА: «Медична бригада надала невідкладну допомогу! Стан стабільний (100% HP)!»',
        force: 0,
        isFsd: true
      });
      setTimeout(() => setCrashBanner(null), 4000);
    }
  };

  // Handle Equip Weapon (1-7: Civilian/Police, 8: AK-74, 9: Stinger, 0: FPV Drone)
  const handleEquipWeapon = (weapon) => {
    const isOwned = ownedWeaponsRef.current?.includes(weapon);
    const isPoliceAuthorized = isPoliceRef.current && ['fists', 'taser', 'pistol', 'handcuffs'].includes(weapon);
    const isArmyAuthorized = isArmyRef.current && ['fists', 'ak74', 'stinger', 'drone'].includes(weapon);

    if (weapon !== 'fists' && !isPoliceAuthorized && !isArmyAuthorized && !isOwned) {
      playAccessDeniedSound();
      setCrashBanner({
        name: '⛔ ЗБРОЯ НЕ КУПЛЕНА! Придбайте її в магазині зброї «КАЛІБР» або вступіть до поліції чи ЗСУ',
        force: 0,
        isFsd: true
      });
      setTimeout(() => setCrashBanner(null), 2500);
      return;
    }
    playClickSound();
    setEquippedWeapon(weapon);
    if (humanRef.current) {
      humanRef.current.setEquippedWeapon(weapon);
    }
    const names = {
      fists: '👊 Кулаки (Рукопашний бій)',
      taser: '⚡ Тайзер Taser X26 (Паралізує порушника на 4с)',
      pistol: '🔫 Пістолет Форт-12Р (45 шкоди)',
      handcuffs: '🔗 Наручники БР-М (Арешт порушників та дебоширів)',
      spray: '💨 Балончик Терен-4М (Осліплює газом на 5с)',
      baton: '🦯 Гумовий кийок ПР-73 (50 шкоди)',
      shotgun: '💥 Помповий дробовик Hatsan Escort (120 шкоди)',
      ak74: '🔫 АК-74 «Калаш» 5.45мм (Черги по «Шахедах» [8])',
      stinger: '🚀 ПЗРК «Stinger» / ППО (Збиття дронів з 1 ракети [9])',
      drone: '🎮 Пульт FPV-дрона (Керування камікадзе [0])'
    };
    setCrashBanner({
      name: `🛡️ ЕКІПІРОВАНО: ${names[weapon] || weapon}`,
      force: 0,
      isFsd: true
    });
    setTimeout(() => setCrashBanner(null), 2000);
  };
  equipWeaponRef.current = handleEquipWeapon;

  // Fire Tank Cannon or Military Truck AA Turret
  const fireTankCannon = () => {
    if (tankCannonCooldownRef.current > 0) return;
    tankCannonCooldownRef.current = isDrivingTankRef.current ? 1.4 : 0.35;

    const p = physicsRef.current;
    if (isDrivingTankRef.current) {
      playTankCannonSound();
      setCombatBanner({ text: '💥 ЗАЛП 125мм ГАРМАТИ ТАНКА ЗСУ!', type: 'shotgun' });
    } else {
      playAk47BurstSound();
      setCombatBanner({ text: '⚡ ЧЕРГА ЗЕНІТНОЇ ТУРЕЛІ БРОНЕВИКА «КОЗАК»!', type: 'shot' });
    }
    setTimeout(() => setCombatBanner(null), 1500);

    // Aim forward into sky (yaw + elevation angle ~30 deg)
    const aimX = -Math.sin(p.yaw);
    const aimY = 0.42;
    const aimZ = -Math.cos(p.yaw);
    const norm = Math.hypot(aimX, aimY, aimZ);
    const aimDir = { x: aimX / norm, y: aimY / norm, z: aimZ / norm };

    const hitRes = airDefenseRef.current?.checkWeaponHit(
      { x: p.x, y: 1.8, z: p.z },
      aimDir,
      {
        type: isDrivingTankRef.current ? 'tank' : 'kozak',
        range: 350.0,
        damage: isDrivingTankRef.current ? 600 : 160,
        isAntiAir: true
      }
    );

    if (hitRes?.type === 'destroyed') {
      setShahedKills(k => k + 1);
      setPlayerMoney(m => m + 500);
      setCrashBanner({
        name: `🎯 ПРЯМЕ ВЛУЧАННЯ! «Шахед-136» знищено вогнем ${isDrivingTankRef.current ? 'Танка' : 'Броневика'} ЗСУ! (+₴500)`,
        force: 0,
        isFsd: true
      });
      setTimeout(() => setCrashBanner(null), 4000);
    }
  };
  fireTankCannonRef.current = fireTankCannon;

  // Handle Melee / Weapon Attack (Q, Click, or Touch button)
  const handlePunch = () => {
    if (isDrivingTankRef.current || isDrivingMilitaryCarRef.current) {
      fireTankCannon();
      return;
    }
    if (!isHumanOnFootRef.current && !activeInteriorRef.current) return;
    if (humanRef.current) {
      const action = humanRef.current.triggerWeaponAction();
      if (action) {
        weaponActionTriggerRef.current = action;
        if (action.type === 'fists') {
          playPunchSwingSound();
        }
      }
    }
  };
  punchRef.current = handlePunch;

  // Enlistment into the Armed Forces of Ukraine (ЗСУ)
  const handleEnlistArmy = () => {
    setIsArmy(true);
    setIsPolice(false);
    try {
      localStorage.setItem('pr5_is_army', 'true');
      localStorage.setItem('pr5_is_police', 'false');
    } catch {}
    if (humanRef.current) {
      humanRef.current.setProfession('army');
      humanRef.current.setEquippedWeapon('ak74');
    }
    setEquippedWeapon('ak74');
    playGunCockSound();
    playRadioBeepSound();
    setCrashBanner({
      name: '🪖 ВАС ЗАРАХОВАНО ДО ЛАВ ЗСУ! Отримано АК-74 [8], ПЗРК [9], FPV-дрон [0]! Слава Україні! 🇺🇦',
      force: 0,
      isFsd: true
    });
    setTimeout(() => setCrashBanner(null), 4500);
  };

  // Resignation from the Armed Forces (ЗСУ)
  const handleDischargeArmy = () => {
    setIsArmy(false);
    try {
      localStorage.setItem('pr5_is_army', 'false');
    } catch {}
    if (humanRef.current) {
      humanRef.current.setProfession('civilian');
      humanRef.current.setEquippedWeapon('fists');
    }
    setEquippedWeapon('fists');
    playClickSound();
    setCrashBanner({
      name: '👤 Ви звільнилися з військової служби у запас.',
      force: 0,
      isFsd: false
    });
    setTimeout(() => setCrashBanner(null), 3500);
  };

  // Open Military Base Modal
  const handleOpenMilitaryBase = () => {
    playClickSound();
    playGunCockSound();
    setActiveMilitaryBase(true);
  };
  openMilitaryBaseRef.current = handleOpenMilitaryBase;

  // Police Siren toggle (Key G: Siren & Strobes)
  const handleToggleSiren = () => {
    if (!isDrivingPoliceCarRef.current) return;
    const nextState = !isSirenOnRef.current;
    setIsSirenOn(nextState);
    isSirenOnRef.current = nextState;
    if (nextState) {
      startPoliceSiren();
      setCrashBanner({
        name: '🚨 СИРЕНА ТА МИГАЛКИ АКТИВОВАНІ (102 У ДОРОЗІ)',
        force: 0,
        isFsd: true
      });
    } else {
      stopPoliceSiren();
      setCrashBanner({
        name: '🔇 СИРЕНУ ТА СПЕЦСИГНАЛИ ВИМКНЕНО',
        force: 0,
        isFsd: true
      });
    }
    setTimeout(() => setCrashBanner(null), 2500);
  };
  toggleSirenRef.current = handleToggleSiren;

  // Sync human character appearance and equipment when profession or weapon changes
  useEffect(() => {
    if (humanRef.current) {
      humanRef.current.setProfession(isArmy ? 'army' : isPolice ? 'police' : 'civilian');
      if (!isPolice && !isArmy) {
        setEquippedWeapon('fists');
        humanRef.current.setEquippedWeapon('fists');
      }
    }
  }, [isPolice, isArmy]);

  useEffect(() => {
    if (humanRef.current) {
      humanRef.current.setEquippedWeapon(equippedWeapon);
    }
  }, [equippedWeapon]);

  // Enter 3D interior (apartment / cottage)
  const handleEnterInterior = (property) => {
    const prop = property || activeHousingRef.current || nearHousingRef.current;
    if (!prop) return;

    playDoorSound();
    setActiveHousing(null);
    setActiveStore(null);

    // Save outdoor position for when returning
    const streetPos = {
      x: humanRef.current ? humanRef.current.x : prop.entranceX,
      z: humanRef.current ? humanRef.current.z : prop.entranceZ,
      yaw: humanRef.current ? humanRef.current.yaw : 0
    };

    setActiveInterior({ property: prop, streetPos });
    activeInteriorRef.current = { property: prop, streetPos };

    // Move human into interior room (elevation y=300)
    if (humanRef.current) {
      humanRef.current.spawn(INTERIOR_ORIGIN.x, INTERIOR_ORIGIN.z + 1.8, Math.PI, INTERIOR_ORIGIN.y);
    }

    setCrashBanner({
      name: `🏡 ВИ УВІЙШЛИ В «${prop.name}» (W/A/S/D — рух • [E] — дія • [Q] — удар • ESC — вихід)`,
      force: 0,
      isFsd: true
    });
    setTimeout(() => setCrashBanner(null), 4000);
  };
  enterInteriorRef.current = handleEnterInterior;

  // Exit 3D interior back to the street
  const handleExitInterior = () => {
    playDoorSound();
    const prev = activeInteriorRef.current;
    const returnPos = prev?.streetPos || {
      x: prev?.property?.entranceX || 0,
      z: prev?.property?.entranceZ || -5,
      yaw: 0
    };

    setActiveInterior(null);
    activeInteriorRef.current = null;
    setNearInteriorInteract(null);

    // Move human back to street level
    if (humanRef.current) {
      humanRef.current.spawn(returnPos.x, returnPos.z, returnPos.yaw || 0, 0);
    }

    setCrashBanner({
      name: '🚪 ВИ ВИЙШЛИ НА ВУЛИЦЮ МІСТА',
      force: 0,
      isFsd: true
    });
    setTimeout(() => setCrashBanner(null), 2500);
  };
  exitInteriorRef.current = handleExitInterior;

  // Handle interior interactions (Bed, Fridge, TV, Exit Door)
  const handleInteriorInteraction = (interaction) => {
    const act = interaction || nearInteriorInteractRef.current;
    if (!act) return;
    if (act.type === 'door') {
      handleExitInterior();
    } else if (act.type === 'bed') {
      playEatingSound();
      setHumanHealth(100);
      setHumanHunger(100);
      setCrashBanner({
        name: '🛏️ СОЛОДКИЙ СОН: Здоров\'я та ситість повністю відновлено (100%)!',
        force: 0,
        isFsd: true
      });
      setTimeout(() => setCrashBanner(null), 3000);
    } else if (act.type === 'fridge') {
      playEatingSound();
      setHumanHunger(prev => Math.min(100, prev + 35));
      setHumanHealth(prev => Math.min(100, prev + 15));
      setCrashBanner({
        name: '🍏 СМАЧНИЙ ПЕРЕКУС З ХОЛОДИЛЬНИКА (+35% ситості, +15% здоров\'я)!',
        force: 0,
        isFsd: true
      });
      setTimeout(() => setCrashBanner(null), 2500);
    } else if (act.type === 'tv') {
      playTvClickSound();
      const channel = interiorRoomRef.current?.switchTvChannel();
      if (channel) {
        setCrashBanner({
          name: `📺 ТЕЛЕВІЗОР: ${channel.title}`,
          force: 0,
          isFsd: true
        });
        setTimeout(() => setCrashBanner(null), 2500);
      }
    }
  };
  interiorInteractRef.current = handleInteriorInteraction;

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen rounded-none border-none'
          : 'h-[660px] rounded-3xl border-2 border-cyan-500/50'
      } overflow-hidden shadow-2xl bg-[#05070e] select-none flex flex-col justify-between`}
    >
      {/* 3D Viewport */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseDown={(e) => {
          if ((isHumanOnFoot || activeInterior) && e.button === 0) {
            handlePunch();
          }
        }}
      />

      {/* ================= AIR RAID SIREN & DRONE THREAT BANNER ================= */}
      {isAlarmActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600/95 border-2 border-yellow-300 px-6 py-2.5 rounded-2xl animate-pulse shadow-[0_0_45px_rgba(239,68,68,1)] text-white select-none pointer-events-none">
          <span className="text-2xl animate-bounce">🚨</span>
          <div className="flex flex-col text-center">
            <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-yellow-200 drop-shadow">
              ПОВІТРЯНА ТРИВОГА! ЗАГРОЗА УДАРНИХ БПЛА «ШАХЕД-136»!
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-white/90">
              Військам ППО зайняти позиції! Збивайте дрони з АК-74 [8], ПЗРК [9], дронів [0] або танка ЗСУ!
            </span>
          </div>
          <span className="text-2xl animate-bounce">🚨</span>
        </div>
      )}

      {/* ================= FPV KAMIKAZE DRONE OSD OVERLAY ================= */}
      {airDefenseRef.current?.isFpvActive && (
        <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-6 select-none font-mono">
          <div className="flex items-center justify-between text-emerald-400 bg-black/60 backdrop-blur-sm p-3 rounded-xl border border-emerald-500/50">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-black tracking-widest text-xs">🔴 FPV REC [00:42] • ЗСУ STRIKE</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span>БАТАРЕЯ: 94% ⚡</span>
              <span>СИГНАЛ: 99% 📶</span>
              <span>РЕЖИМ: АТАКА КАМІКАДЗЕ</span>
            </div>
          </div>

          {/* Central Target Reticle */}
          <div className="self-center flex flex-col items-center justify-center opacity-85">
            <div className="relative w-24 h-24 border-2 border-dashed border-emerald-400 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>
            <span className="mt-2 text-xs font-black text-emerald-300 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40">
              ТАРАНЬТЕ «ШАХЕД» У ПОВІТРІ
            </span>
          </div>

          <div className="flex items-center justify-between text-emerald-400 bg-black/60 backdrop-blur-sm p-3 rounded-xl border border-emerald-500/50 text-xs">
            <span>КЕРУВАННЯ: W/S (Тяга/Тангаж) • A/D (Поворот) • Space (Вгору) • Shift (Вниз)</span>
            <span className="text-amber-300 font-bold">[ESC] СКАСУВАТИ ПОЛІТ</span>
          </div>
        </div>
      )}

      {/* Supermarket Modal */}
      {activeStore && (
        <SupermarketModal
          store={activeStore}
          playerMoney={playerMoney}
          setPlayerMoney={setPlayerMoney}
          humanHealth={humanHealth}
          setHumanHealth={setHumanHealth}
          humanHunger={humanHunger}
          setHumanHunger={setHumanHunger}
          onClose={() => setActiveStore(null)}
        />
      )}

      {/* Buyable Housing Modal */}
      {activeHousing && (
        <HousingModal
          property={activeHousing}
          isOwned={ownedProperties.includes(activeHousing.id)}
          playerMoney={playerMoney}
          onBuy={handleBuyProperty}
          onEnterInterior={handleEnterInterior}
          humanHealth={humanHealth}
          setHumanHealth={setHumanHealth}
          humanHunger={humanHunger}
          setHumanHunger={setHumanHunger}
          onParkCar={handleParkCarAtHome}
          onClose={() => setActiveHousing(null)}
        />
      )}

      {/* National Police Department Modal */}
      {activePoliceStation && (
        <PoliceStationModal
          isPolice={isPolice}
          setIsPolice={(val) => {
            setIsPolice(val);
            if (humanRef.current) humanRef.current.setProfession(val ? 'police' : 'civilian');
            if (!val) {
              setEquippedWeapon('fists');
              if (humanRef.current) humanRef.current.setEquippedWeapon('fists');
            }
          }}
          arrestsCount={policeArrests}
          playerMoney={playerMoney}
          onClose={() => setActivePoliceStation(false)}
        />
      )}

      {/* Modern City Smartphone Modal (101 DSNS, 102 Police, 103 Ambulance, SMS) */}
      {isPhoneOpen && (
        <PhoneModal
          isOpen={isPhoneOpen}
          onClose={() => setIsPhoneOpen(false)}
          isPolice={isPolice}
          isArmy={isArmy}
          onEnlistArmy={handleEnlistArmy}
          onDischargeArmy={handleDischargeArmy}
          playerMoney={playerMoney}
          onEmergencyCall={handleEmergencyCall}
          onTriggerAlarm={() => {
            airDefenseRef.current?.triggerAirAlarm();
          }}
          onSendSms={() => {}}
          onJoinPolice={() => {
            setIsPhoneOpen(false);
            setActivePoliceStation(true);
          }}
        />
      )}

      {/* Military Base & Armed Forces of Ukraine (ЗСУ) Modal */}
      {activeMilitaryBase && (
        <MilitaryBaseModal
          isOpen={activeMilitaryBase}
          onClose={() => setActiveMilitaryBase(false)}
          isArmy={isArmy}
          onEnlist={handleEnlistArmy}
          onDischarge={handleDischargeArmy}
          setIsArmy={(val) => val ? handleEnlistArmy() : handleDischargeArmy()}
          shahedKills={shahedKills}
          playerMoney={playerMoney}
          setPlayerMoney={setPlayerMoney}
          isAlarmActive={isAlarmActive}
          onTriggerAlarm={() => {
            airDefenseRef.current?.triggerAirAlarm();
          }}
          onTriggerAirAlarm={() => {
            airDefenseRef.current?.triggerAirAlarm();
          }}
          onEquipMilitaryWeapons={() => {
            handleEquipWeapon('ak74');
          }}
          onEquipArmyWeapon={(weapon) => {
            handleEquipWeapon(weapon || 'ak74');
          }}
        />
      )}

      {/* Gun & Tactical Equipment Shop Modal */}
      {activeGunShop && (
        <GunShopModal
          isOpen={!!activeGunShop}
          onClose={() => setActiveGunShop(null)}
          playerMoney={playerMoney}
          onBuyWeapon={handleBuyWeapon}
          ownedWeapons={ownedWeapons}
          isPolice={isPolice}
        />
      )}

      {/* Multiplayer Lobby & Server Connection Modal */}
      {isMultiplayerOpen && (
        <MultiplayerModal
          isOpen={isMultiplayerOpen}
          onClose={() => setIsMultiplayerOpen(false)}
          multiplayerManager={multiplayerManagerRef.current}
          isPolice={isPolice}
          isArmy={isArmy}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          connectedPlayersCount={connectedPlayersList.length + 1}
          playersList={connectedPlayersList}
        />
      )}

      {/* Multiplayer In-Game Chat System */}
      <MultiplayerChat
        multiplayerManager={multiplayerManagerRef.current}
        role={isArmy ? 'army' : isPolice ? 'police' : 'civilian'}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />

      {/* Multiplayer TAB Scoreboard Overlay */}
      <ScoreboardOverlay
        isOpen={isScoreboardOpen}
        multiplayerManager={multiplayerManagerRef.current}
        selfNickname={multiplayerManagerRef.current?.nickname || 'Гравець'}
        selfRole={isArmy ? 'army' : isPolice ? 'police' : 'civilian'}
        selfVehicle={
          isHumanOnFoot
            ? '🚶 Пішки'
            : isDrivingTank
            ? '🛡️ Танк Т-64БВ'
            : isDrivingMilitaryCar
            ? '🚛 Козак-2М'
            : isDrivingPoliceCar
            ? '🚓 Патруль 102'
            : `🚗 ${carConfig.modelId.toUpperCase()}`
        }
        selfShahedKills={shahedKills}
        selfMoney={playerMoney}
        playersList={connectedPlayersList}
        selectedCity={selectedCity}
      />

      {/* Melee Street Combat Banner */}
      {combatBanner && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-sm font-black border-2 border-white shadow-2xl animate-bounce pointer-events-none select-none bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white">
          <span>{combatBanner.text}</span>
        </div>
      )}

      {/* Active 3D Interior Living Mode Top Banner */}
      {activeInterior && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-950/95 border-2 border-amber-400 px-6 py-2.5 rounded-2xl shadow-[0_0_35px_rgba(251,191,36,0.6)] select-none animate-in fade-in">
          <Home size={22} className="text-amber-400" />
          <div className="flex flex-col">
            <span className="text-xs font-black text-white flex items-center gap-2">
              <span>{activeInterior.property.name}</span>
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                3D ІНТЕР'ЄР
              </span>
            </span>
            <span className="text-[11px] font-mono text-amber-200">
              {nearInteriorInteract
                ? `👉 ${nearInteriorInteract.prompt} [E / Enter]`
                : 'Підійдіть до ліжка, холодильника, телевізора або дверей'}
            </span>
          </div>
          {nearInteriorInteract && (
            <button
              onClick={() => handleInteriorInteraction(nearInteriorInteract)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md animate-pulse flex items-center gap-1.5"
            >
              <span>{nearInteriorInteract.name} [E]</span>
            </button>
          )}
          <button
            onClick={handleExitInterior}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1"
          >
            <DoorOpen size={14} />
            <span>ВИЙТИ [ESC]</span>
          </button>
        </div>
      )}

      {/* Near Supermarket Interactive Banner */}
      {nearStore && !activeStore && !activeHousing && !activeInterior && (
        <div
          onClick={handleOpenStore}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-gradient-to-r from-red-600 via-rose-700 to-amber-600 text-white px-6 py-3 rounded-2xl border-2 border-white shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-bounce cursor-pointer hover:scale-105 transition-all select-none"
        >
          <ShoppingBag size={22} className="text-yellow-300" />
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>Вхід до {nearStore.name}</span>
            </span>
            <span className="text-[11px] font-mono text-amber-200">
              Натисніть [F] або [ENTER], щоб купити їжу, воду та ліки
            </span>
          </div>
          <button className="px-3 py-1 bg-white text-slate-950 font-black text-xs rounded-xl hover:bg-amber-200 transition-all shadow-md">
            ВІДКРИТИ
          </button>
        </div>
      )}

      {/* Near Housing Interactive Banner */}
      {nearHousing && !activeHousing && !activeStore && !activeInterior && (
        <div
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 text-white px-6 py-3 rounded-2xl border-2 border-white shadow-[0_0_35px_rgba(16,185,129,0.7)] animate-bounce select-none"
        >
          <Home size={22} className="text-yellow-300" />
          <div className="flex flex-col cursor-pointer" onClick={handleOpenHousing}>
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>{nearHousing.name}</span>
              {ownedProperties.includes(nearHousing.id) ? (
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                  ВЛАСНІСТЬ 🏠
                </span>
              ) : (
                <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                  ЦІНА: ₴{nearHousing.price}
                </span>
              )}
            </span>
            <span className="text-[11px] font-mono text-emerald-200">
              {ownedProperties.includes(nearHousing.id)
                ? 'Натисніть [F] для огляду, або кнопку нижче для входу в кімнату'
                : 'Натисніть [F] або [ENTER], щоб оглянути та придбати за ₴100'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {ownedProperties.includes(nearHousing.id) && (
              <button
                onClick={() => handleEnterInterior(nearHousing)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1"
                title="Увійти в 3D квартиру/будинок"
              >
                <DoorOpen size={14} />
                <span>3D КІМНАТА</span>
              </button>
            )}
            <button
              onClick={handleOpenHousing}
              className="px-3 py-1.5 bg-white hover:bg-emerald-200 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md"
            >
              {ownedProperties.includes(nearHousing.id) ? 'МЕНЮ' : 'КУПИТИ ЗА ₴100'}
            </button>
          </div>
        </div>
      )}

      {/* Near Police Department Interactive Banner */}
      {nearPoliceStation && !activePoliceStation && !activeStore && !activeHousing && !activeInterior && (
        <div
          onClick={() => setActivePoliceStation(true)}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white px-6 py-3 rounded-2xl border-2 border-cyan-400 shadow-[0_0_35px_rgba(59,130,246,0.8)] animate-bounce cursor-pointer hover:scale-105 transition-all select-none"
        >
          <Shield size={24} className="text-yellow-300" />
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>🇺🇦 ГОЛОВНЕ УПРАВЛІННЯ НАЦІОНАЛЬНОЇ ПОЛІЦІЇ (102)</span>
              {isPolice && (
                <span className="bg-yellow-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                  ОФІЦЕР НА СЛУЖБІ 🌟
                </span>
              )}
            </span>
            <span className="text-[11px] font-mono text-cyan-200">
              {isPolice
                ? 'Натисніть [F] або [ENTER], щоб переглянути службове посвідчення та статистику затримань'
                : 'Натисніть [F] або [ENTER], щоб скласти присягу та вступити до лав поліції'}
            </span>
          </div>
          <button className="px-3.5 py-1 bg-yellow-400 text-slate-950 font-black text-xs rounded-xl hover:bg-yellow-300 transition-all shadow-md">
            {isPolice ? 'ДОСЬЄ ПОЛІЦІЇ' : 'ВСТУПИТИ'}
          </button>
        </div>
      )}

      {/* Near Gun Shop Interactive Banner */}
      {nearGunShop && !activeGunShop && !activeStore && !activeHousing && !activePoliceStation && !activeInterior && !isPhoneOpen && (
        <div
          onClick={handleOpenGunShop}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 text-white px-6 py-3 rounded-2xl border-2 border-red-400 shadow-[0_0_35px_rgba(239,68,68,0.8)] animate-bounce cursor-pointer hover:scale-105 transition-all select-none"
        >
          <Crosshair size={24} className="text-yellow-300" />
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>🔫 {nearGunShop.name} (МАГАЗИН ЗБРОЇ 24/7)</span>
            </span>
            <span className="text-[11px] font-mono text-red-200">
              Натисніть [F] або [ENTER], щоб придбати пістолет, дробовик, балончик, кийок або бронежилет
            </span>
          </div>
          <button className="px-3.5 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition-all shadow-md">
            ВІДКРИТИ
          </button>
        </div>
      )}

      {/* Near Dedicated Police Patrol Car Banner */}
      {isHumanOnFoot && nearPoliceCar && !activeStore && !activeHousing && !activePoliceStation && !activeInterior && (
        <div
          onClick={handleToggleExitEnterCar}
          className={`absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 text-white px-6 py-3 rounded-2xl border-2 shadow-2xl animate-bounce cursor-pointer hover:scale-105 transition-all select-none ${
            isPolice
              ? 'bg-gradient-to-r from-blue-600 via-indigo-700 to-cyan-700 border-yellow-300 shadow-[0_0_35px_rgba(59,130,246,0.9)]'
              : 'bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.7)]'
          }`}
        >
          {isPolice ? <Shield size={24} className="text-yellow-300" /> : <Lock size={24} className="text-red-400" />}
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>🚓 ПАТРУЛЬНЕ АВТО НАЦІОНАЛЬНОЇ ПОЛІЦІЇ (102)</span>
              {isPolice ? (
                <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                  ДОСТУП ДОЗВОЛЕНО
                </span>
              ) : (
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black">
                  ТІЛЬКИ ДЛЯ ПОЛІЦІЇ 🔒
                </span>
              )}
            </span>
            <span className="text-[11px] font-mono text-slate-200">
              {isPolice
                ? 'Натисніть [E] або натисніть тут, щоб сісти за кермо службового авто'
                : 'Вступіть до поліції у відділку поруч [F], щоб отримати службовий доступ'}
            </span>
          </div>
          <button
            className={`px-3.5 py-1 font-black text-xs rounded-xl shadow-md transition-all ${
              isPolice
                ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isPolice ? 'СІСТИ В АВТО' : 'ЗАБЛОКОВАНО'}
          </button>
        </div>
      )}

      {/* Near Armed Forces of Ukraine (ЗСУ) Base Interactive Banner */}
      {nearMilitaryBase && !activeMilitaryBase && !activeStore && !activeHousing && !activePoliceStation && !activeGunShop && !activeInterior && !isPhoneOpen && (
        <div
          onClick={() => setActiveMilitaryBase(true)}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-gradient-to-r from-emerald-900 via-green-950 to-slate-900 text-white px-6 py-3 rounded-2xl border-2 border-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.8)] animate-bounce cursor-pointer hover:scale-105 transition-all select-none"
        >
          <span className="text-2xl">🪖</span>
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>🇺🇦 ВІЙСЬКОВА ЧАСТИНА ЗСУ • ШТАБ ППО</span>
              {isArmy && (
                <span className="bg-yellow-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                  БОЄЦЬ ЗСУ 🎖️
                </span>
              )}
            </span>
            <span className="text-[11px] font-mono text-yellow-200">
              {isArmy
                ? 'Натисніть [F] або [ENTER], щоб отримати АК-74, ПЗРК, FPV-дрон та оглянути танк Т-64'
                : 'Натисніть [F] або [ENTER], щоб вступити до ЗСУ та захищати місто від шахедів'}
            </span>
          </div>
          <button className="px-3.5 py-1 bg-yellow-400 text-slate-950 font-black text-xs rounded-xl hover:bg-yellow-300 transition-all shadow-md">
            {isArmy ? 'ШТАБ ЗСУ' : 'ВСТУПИТИ В ЗСУ'}
          </button>
        </div>
      )}

      {/* Near ZSU Main Battle Tank T-64BV Interactive Banner */}
      {isHumanOnFoot && nearTank && !activeStore && !activeHousing && !activePoliceStation && !activeMilitaryBase && !activeGunShop && !activeInterior && (
        <div
          onClick={handleToggleExitEnterCar}
          className={`absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 text-white px-6 py-3 rounded-2xl border-2 shadow-2xl animate-bounce cursor-pointer hover:scale-105 transition-all select-none ${
            isArmy
              ? 'bg-gradient-to-r from-emerald-800 via-green-900 to-slate-950 border-yellow-300 shadow-[0_0_35px_rgba(234,179,8,0.9)]'
              : 'bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.7)]'
          }`}
        >
          <span className="text-2xl">🛡️</span>
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>🇺🇦 БОЙОВИЙ ТАНК ЗСУ Т-64БВ (125мм ГАРМАТА)</span>
              {isArmy ? (
                <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                  ДОСТУП ДОЗВОЛЕНО
                </span>
              ) : (
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black">
                  ТІЛЬКИ ДЛЯ АРМІЇ ЗСУ 🔒
                </span>
              )}
            </span>
            <span className="text-[11px] font-mono text-slate-200">
              {isArmy
                ? 'Натисніть [E] або натисніть тут, щоб сісти за штурвал танка (Постріл гармати: [Space] / [Q])'
                : 'Вступіть до ЗСУ на військовій базі поруч [F], щоб отримати допуск до бойової техніки!'}
            </span>
          </div>
          <button
            className={`px-3.5 py-1 font-black text-xs rounded-xl shadow-md transition-all ${
              isArmy
                ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isArmy ? 'СІСТИ В ТАНК' : 'ЗАБЛОКОВАНО'}
          </button>
        </div>
      )}

      {/* Near ZSU Kozak-2M AA Armored Vehicle Banner */}
      {isHumanOnFoot && nearMilitaryCar && !activeStore && !activeHousing && !activePoliceStation && !activeMilitaryBase && !activeGunShop && !activeInterior && (
        <div
          onClick={handleToggleExitEnterCar}
          className={`absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 text-white px-6 py-3 rounded-2xl border-2 shadow-2xl animate-bounce cursor-pointer hover:scale-105 transition-all select-none ${
            isArmy
              ? 'bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 border-yellow-300 shadow-[0_0_35px_rgba(234,179,8,0.9)]'
              : 'bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.7)]'
          }`}
        >
          <span className="text-2xl">🚛</span>
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>🇺🇦 БРОНЕАВТОМОБІЛЬ ППО «КОЗАК-2М» (ТУРЕЛЬ ДШК)</span>
              {isArmy ? (
                <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                  ДОСТУП ДОЗВОЛЕНО
                </span>
              ) : (
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black">
                  ТІЛЬКИ ДЛЯ АРМІЇ ЗСУ 🔒
                </span>
              )}
            </span>
            <span className="text-[11px] font-mono text-slate-200">
              {isArmy
                ? 'Натисніть [E] або натисніть тут, щоб сісти за кермо бронеавтомобіля ППО'
                : 'Вступіть до ЗСУ на військовій базі поруч [F], щоб керувати броньовиком!'}
            </span>
          </div>
          <button
            className={`px-3.5 py-1 font-black text-xs rounded-xl shadow-md transition-all ${
              isArmy
                ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isArmy ? 'СІСТИ В БРОНЕВИК' : 'ЗАБЛОКОВАНО'}
          </button>
        </div>
      )}

      {/* Near Car Interactive Banner (When on foot and near car) */}
      {isHumanOnFoot && canEnterCar && !activeStore && !activeHousing && !activeInterior && (
        <div
          onClick={handleToggleExitEnterCar}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl border-2 border-white shadow-[0_0_35px_rgba(6,182,212,0.8)] animate-bounce cursor-pointer hover:scale-105 transition-all select-none"
        >
          <LogIn size={22} className="text-yellow-300" />
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>🚗 ВИ БІЛЯ ВАШОГО АВТОМОБІЛЯ</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-200">
              Натисніть [E], [У] або натисніть тут, щоб сісти за кермо
            </span>
          </div>
          <button className="px-3.5 py-1 bg-white text-slate-950 font-black text-xs rounded-xl hover:bg-cyan-200 transition-all shadow-md">
            СІСТИ В АВТО
          </button>
        </div>
      )}

      {/* Dedicated Parking Lot Status Badge */}
      {currentParkingLot && (
        <div className="absolute top-20 right-4 z-20 flex items-center gap-2 bg-blue-950/90 border border-blue-400/80 px-4 py-2 rounded-xl shadow-lg">
          <span className="text-base font-black text-blue-400">🅿️</span>
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-300 font-mono font-bold uppercase">Паркувальне місце</span>
            <span className="text-xs font-bold text-white truncate max-w-[220px]">{currentParkingLot}</span>
          </div>
        </div>
      )}

      {/* ================= TOP HUD: LOCATION & ACTION BAR ================= */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/85 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playClickSound();
              dynamicAudio.stop();
              onExitDrive();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 shadow-xl transition-all"
          >
            <ArrowLeft size={16} />
            Повернутися до тюнінгу
          </button>

          {/* City Selector Pill */}
          <div className="flex items-center gap-1 bg-slate-950/95 p-1 rounded-xl border border-cyan-500/50 shadow-xl text-xs font-mono font-bold">
            <button
              onClick={() => handleSelectCity('kyiv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedCity === 'kyiv'
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-md shadow-yellow-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Перейти у Київ (Хрещатик, Майдан Незалежності, Дніпро, Золоті Ворота)"
            >
              <Landmark size={13} className={selectedCity === 'kyiv' ? 'text-slate-950' : 'text-yellow-400'} />
              <span>Київ 🏛️</span>
            </button>
            <button
              onClick={() => handleSelectCity('vinnytsia')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedCity === 'vinnytsia'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Перейти у Вінницю (Вежа, Південний Буг, Фонтан Roshen)"
            >
              <MapPin size={13} className={selectedCity === 'vinnytsia' ? 'text-slate-950' : 'text-cyan-400'} />
              <span>Вінниця 🏙️</span>
            </button>
            <button
              onClick={() => handleSelectCity('zaporizhzhia')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedCity === 'zaporizhzhia'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Перейти у Запоріжжя (ДніпроГЕС, Хортиця, Запорозька Січ, пр. Соборний)"
            >
              <Zap size={13} className={selectedCity === 'zaporizhzhia' ? 'text-slate-950' : 'text-amber-400'} />
              <span>Запоріжжя ⚡</span>
            </button>
          </div>

          {/* Survival Status: Health, Hunger, Cash */}
          <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 shadow-md text-xs font-mono">
            {/* Health */}
            <div className="flex items-center gap-1.5" title={`Здоров'я: ${Math.round(humanHealth)}%`}>
              <Heart size={14} className={humanHealth < 30 ? 'text-rose-500 animate-ping' : 'text-rose-400'} />
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    humanHealth > 60 ? 'bg-emerald-500' : humanHealth > 30 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.round(humanHealth)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-rose-300">{Math.round(humanHealth)}%</span>
            </div>

            <div className="w-px h-4 bg-slate-700" />

            {/* Hunger */}
            <div className="flex items-center gap-1.5" title={`Ситість: ${Math.round(humanHunger)}%`}>
              <Utensils size={14} className={humanHunger < 25 ? 'text-amber-500 animate-bounce' : 'text-amber-400'} />
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    humanHunger > 50 ? 'bg-amber-500' : humanHunger > 20 ? 'bg-orange-500' : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.round(humanHunger)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-amber-300">{Math.round(humanHunger)}%</span>
            </div>

            <div className="w-px h-4 bg-slate-700" />

            {/* Money */}
            <div className="flex items-center gap-1 text-emerald-400 font-bold" title="Баланс готівки">
              <DollarSign size={14} />
              <span>₴{playerMoney.toLocaleString()}</span>
            </div>

            <div className="w-px h-4 bg-slate-700" />

            {/* Housing Badge */}
            <div
              className={`flex items-center gap-1 font-bold ${
                ownedProperties.length > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
              title={`Куплено будинків та квартир: ${ownedProperties.length}`}
            >
              <Home size={13} className={ownedProperties.length > 0 ? 'text-amber-400' : 'text-slate-500'} />
              <span>{ownedProperties.length > 0 ? `Дім 🏠 (${ownedProperties.length})` : 'Без житла'}</span>
            </div>

            <div className="w-px h-4 bg-slate-700" />

            {/* Police Profession Status Badge */}
            <div
              onClick={() => setActivePoliceStation(true)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-bold cursor-pointer transition-all ${
                isPolice
                  ? 'bg-blue-950 border-blue-400 text-blue-300 hover:bg-blue-900 shadow-sm'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isPolice ? `Офіцер Національної Поліції (Затримань: ${policeArrests}). Натисніть для досьє.` : 'Цивільний статус. Натисніть, щоб вступити до поліції'}
            >
              <Shield size={13} className={isPolice ? 'text-yellow-400' : 'text-slate-500'} />
              <span>{isPolice ? `Поліція 102 (${policeArrests} 🔗)` : 'Цивільний'}</span>
            </div>

            <div className="w-px h-4 bg-slate-700" />

            {/* Army Profession (ЗСУ) Status Badge */}
            <div
              onClick={() => {
                playClickSound();
                playGunCockSound();
                setActiveMilitaryBase(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border font-bold cursor-pointer transition-all ${
                isArmy
                  ? 'bg-emerald-950 border-yellow-400 text-yellow-300 hover:bg-emerald-900 shadow-sm'
                  : 'bg-gradient-to-r from-emerald-800 to-green-700 border-yellow-400 text-yellow-200 hover:from-emerald-700 hover:to-green-600 shadow-md animate-pulse ring-1 ring-yellow-400/50'
              }`}
              title={isArmy ? `Боєць ЗСУ (Збито шахедів: ${shahedKills} 🎯). Натисніть для штабу ППО.` : 'Цивільний статус. Натисніть, щоб вступити до лав ЗСУ! 🪖'}
            >
              <span className="text-xs">🪖</span>
              <span>{isArmy ? `ЗСУ (${shahedKills} 🎯)` : 'ВСТУП В ЗСУ 🪖'}</span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-cyan-400 font-bold">Локація:</span>
            <span>{selectedCity === 'kyiv' ? 'Хрещатик • Майдан • Поділ • Дніпро' : selectedCity === 'zaporizhzhia' ? 'ДніпроГЕС • Хортиця • пр. Соборний' : 'вул. Соборна • Вежа • Центральний міст'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Exit / Enter Vehicle Button */}
          <button
            onClick={handleToggleExitEnterCar}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${
              isHumanOnFoot
                ? canEnterCar
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40 ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-slate-900/90 text-slate-400 border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/40'
            }`}
            title={isHumanOnFoot ? 'Сісти в автомобіль (E)' : 'Вийти з автомобіля пішки (E)'}
          >
            {isHumanOnFoot ? (
              canEnterCar ? (
                <>
                  <LogIn size={14} />
                  <span>СІСТИ В АВТО (E)</span>
                </>
              ) : (
                <>
                  <User size={14} />
                  <span>ПІШКИ (ДАЛЕКО ВІД АВТО)</span>
                </>
              )
            ) : (
              <>
                <LogOut size={14} />
                <span>ВИЙТИ З АВТО (E)</span>
              </>
            )}
          </button>
          {/* Route Planner Toggle Button */}
          <button
            onClick={() => {
              playClickSound();
              setShowRoutePlanner(!showRoutePlanner);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${
              showRoutePlanner
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-300'
                : 'bg-slate-900/90 text-amber-300 border border-amber-500/40 hover:bg-amber-950/50'
            }`}
            title="Прокласти власний маршрут для автопілота"
          >
            <RouteIcon size={14} />
            <span>МАРШРУТ FSD ({customRoute.length})</span>
          </button>

          {/* Tesla Autopilot Button */}
          <button
            onClick={toggleAutopilot}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${
              isAutopilot
                ? 'bg-blue-600 text-white shadow-blue-500/50 ring-2 ring-cyan-300 animate-pulse'
                : 'bg-slate-900/90 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-950/60'
            }`}
            title="Увімкнути/вимкнути автопілот Tesla FSD (Клавіша F)"
          >
            <Zap size={14} className={isAutopilot ? 'text-cyan-200' : 'text-cyan-400'} />
            <span>{isAutopilot ? '⚡ FSD АКТИВНИЙ (F)' : '⚡ FSD (F)'}</span>
          </button>

          {/* Auto-Forward Cruise Button */}
          <button
            onClick={toggleAutoForward}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${
              isAutoForward
                ? 'bg-emerald-600 text-white shadow-emerald-500/50 ring-2 ring-emerald-300 animate-pulse'
                : 'bg-slate-900/90 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-950/60'
            }`}
            title="Авто-тяга вперед: машина сама газує вперед, а ви тільки рулюєте (Клавіша V)"
          >
            <Zap size={14} className={isAutoForward ? 'text-emerald-200' : 'text-emerald-400'} />
            <span>{isAutoForward ? '🚀 АВТО-ТЯГА (V)' : '🚀 АВТО-ТЯГА (V)'}</span>
          </button>

          {/* Repair Button */}
          <button
            onClick={handleRepair}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all"
            title="Відновити геометрію авто та полагодити кузов (R)"
          >
            <Wrench size={14} />
            <span>СТО / Ремонт (R)</span>
          </button>

          <button
            onClick={handleResetCar}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="На міст до старту"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggleCamera}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition-all hover:bg-cyan-400"
            title="Перемкнути ракурс камери (Клавіша X)"
          >
            <Camera size={14} />
            {cameraMode === 'chase' ? 'Камера: Ззаду (X)' : cameraMode === 'cockpit' ? 'Камера: Салон (X)' : 'Камера: Зверху (X)'}
          </button>

          {/* Multiplayer Online Button */}
          <button
            onClick={() => {
              playClickSound();
              setIsMultiplayerOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${
              connectedPlayersList.length > 0
                ? 'bg-emerald-600 text-white shadow-emerald-500/50 ring-2 ring-emerald-300 animate-pulse'
                : 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white border border-cyan-400/60 hover:from-teal-600 hover:to-cyan-700'
            }`}
            title="Відкрити мультиплеєр онлайн: створити кімнату, грати разом із друзями"
          >
            <Globe size={14} className={connectedPlayersList.length > 0 ? 'text-yellow-300 animate-spin' : 'text-cyan-300'} />
            <span>🌐 ОНЛАЙН {connectedPlayersList.length > 0 ? `(${connectedPlayersList.length + 1})` : ''}</span>
          </button>

          {/* Smartphone Button */}
          <button
            onClick={() => {
              playClickSound();
              setIsPhoneOpen(prev => !prev);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${
              isPhoneOpen
                ? 'bg-blue-600 text-white shadow-blue-500/50 ring-2 ring-cyan-300 animate-pulse'
                : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white border border-cyan-400/60 hover:from-blue-600 hover:to-indigo-700'
            }`}
            title="Відкрити смартфон (Клавіша P): Дзвінки 101 ДСНС, 102 Поліція, СМС жителям міста"
          >
            <Phone size={14} className="text-yellow-300" />
            <span>📱 ТЕЛЕФОН (P)</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-black text-xs border border-cyan-500/50 shadow-lg transition-all"
            title={isFullscreen ? 'Вийти з повноекранного режиму (Клавіша C)' : 'Грати на весь екран (Клавіша C)'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isFullscreen ? 'ВІКНО (C)' : 'ПОВНИЙ ЕКРАН (C)'}</span>
          </button>
        </div>
      </div>

      {/* ================= CRASH / TOTAL WRECK WARNING BANNER ================= */}
      {crashBanner && (
        <div className="relative z-20 flex flex-col items-center justify-center animate-bounce pointer-events-none">
          <div
            className={`flex items-center gap-2.5 font-black px-6 py-2.5 rounded-2xl text-sm tracking-wider border-2 border-white shadow-2xl ${
              crashBanner.isTotalWreck
                ? 'bg-gradient-to-r from-red-600 via-rose-700 to-black text-white shadow-[0_0_50px_rgba(239,68,68,1)] animate-pulse'
                : crashBanner.isFsd
                ? 'bg-blue-600/95 text-white shadow-[0_0_40px_rgba(56,189,248,0.9)]'
                : 'bg-red-600/90 text-white shadow-[0_0_40px_rgba(239,68,68,0.9)]'
            }`}
          >
            {crashBanner.isTotalWreck ? (
              <Flame size={24} className="text-yellow-300 animate-spin" />
            ) : crashBanner.isFsd ? (
              <Zap size={20} className="text-yellow-300 animate-pulse" />
            ) : (
              <AlertTriangle size={20} className="text-yellow-300" />
            )}
            <span>
              {crashBanner.isTotalWreck
                ? '💥 ТОТАЛЬНЕ ЗНИЩЕННЯ АВТО! ДВИГУН РОЗБИТО ТА ГОРИТЬ! (НАТИСНІТЬ R ДЛЯ СТО)'
                : crashBanner.isFsd
                ? crashBanner.name
                : `АВАРІЯ! ЗІТКНЕННЯ З: ${crashBanner.name.toUpperCase()}! СИЛА: ${crashBanner.force}G`}
            </span>
          </div>
        </div>
      )}

      {/* ================= TESLA FSD LIVE NAVIGATION HUD ================= */}
      {telemetry.isAutopilot && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-950/95 border-2 border-cyan-400 px-5 py-2.5 rounded-2xl shadow-[0_0_35px_rgba(56,189,248,0.6)]">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-cyan-300 tracking-wider flex items-center gap-1.5">
              <Navigation size={13} className="text-cyan-400" />
              {telemetry.routeCompleted
                ? '🏁 МАРШРУТ УСПІШНО ЗАВЕРШЕНО!'
                : `⚡ ${getAutopilotBrandName(carConfig.modelId)}: СЛІДУЄ ЗА МАРШРУТОМ (${telemetry.autopilotIdx + 1} з ${telemetry.autopilotRoute?.length || 1})`}
            </span>
            <span className="text-[10px] text-slate-300 font-mono">
              Ціль: {telemetry.autopilotTarget?.name || 'Вінниця Центр'}
            </span>
          </div>
        </div>
      )}

      {/* ================= AUTO-FORWARD (KEY V: CRUISE THROTTLE) LIVE HUD ================= */}
      {isAutoForward && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-950/95 border-2 border-emerald-400 px-5 py-2.5 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.7)] animate-pulse">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-emerald-300 tracking-wider flex items-center gap-1.5">
              🚀 АВТО-ТЯГА АКТИВНА [V] (КРУЇЗ)
            </span>
            <span className="text-[10px] text-slate-300 font-mono">
              Машина їде вперед сама • Ви рулюєте (A / D або Стрілки) • Гальма: S
            </span>
          </div>
        </div>
      )}

      {/* ================= INTERACTIVE ROUTE PLANNER DRAWER ================= */}
      {showRoutePlanner && (
        <div className="absolute top-20 left-4 z-30 w-80 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 max-h-[540px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase font-mono">
              <RouteIcon size={16} />
              <span>Конструктор Маршруту FSD</span>
            </div>
            <button
              onClick={() => setShowRoutePlanner(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          {/* Interactive Clickable Map Canvas */}
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>КЛІКНІТЬ НА КАРТІ ДЛЯ ТОЧКИ:</span>
              <span className="text-cyan-400 font-bold">{customRoute.length} точок</span>
            </div>

            <div
              onClick={handleMapClick}
              className="relative w-full h-36 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 cursor-crosshair group"
            >
              {/* Streets Overlay on Planner Map */}
              {selectedCity === 'kyiv' ? (
                <>
                  <div className="absolute top-0 right-0 w-8 h-full bg-cyan-950/80 pointer-events-none" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-slate-800 pointer-events-none" />
                </>
              ) : selectedCity === 'zaporizhzhia' ? (
                <>
                  <div className="absolute top-0 left-[24%] w-10 h-full bg-cyan-950/80 pointer-events-none" />
                  <div className="absolute top-0 right-4 w-4 h-full bg-slate-800 pointer-events-none" />
                </>
              ) : (
                <>
                  <div className="absolute top-[48%] left-0 w-full h-6 bg-cyan-900/60 -translate-y-1/2 pointer-events-none" />
                  <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-4 h-10 bg-slate-600 pointer-events-none" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-full bg-slate-800/80 pointer-events-none" />
                  <div className="absolute top-[65%] left-0 w-1/2 h-3.5 bg-slate-800/80 pointer-events-none" />
                </>
              )}

              {/* Waypoint pins on canvas */}
              {customRoute.map((wp, i) => (
                <div
                  key={i}
                  className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 border border-slate-950 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[7px] font-bold text-slate-950 font-mono shadow-md"
                  style={{
                    left: `${50 + (wp.x / 280) * 100}%`,
                    top: `${50 + (wp.z / 280) * 100}%`
                  }}
                >
                  {i + 1}
                </div>
              ))}

              {/* Current Player Car Dot */}
              <div
                className="absolute w-3 h-3 rounded-full bg-yellow-400 border-2 border-slate-950 -translate-x-1/2 -translate-y-1/2 animate-pulse pointer-events-none"
                style={{
                  left: `${50 + (telemetry.carX / 280) * 100}%`,
                  top: `${50 + (telemetry.carZ / 280) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Quick Landmark Buttons */}
          <div>
            <div className="text-[10px] font-mono text-slate-400 mb-1.5 uppercase">
              Додати пам'ятку ({selectedCity === 'kyiv' ? 'Київ' : selectedCity === 'zaporizhzhia' ? 'Запоріжжя' : 'Вінниця'}):
            </div>
            <div className="flex flex-wrap gap-1">
              {(selectedCity === 'kyiv' ? KYIV_LANDMARKS : selectedCity === 'zaporizhzhia' ? ZAPORIZHZHIA_LANDMARKS : VINNYTSIA_LANDMARKS).slice(0, 7).map(lm => (
                <button
                  key={lm.id}
                  onClick={() => addLandmarkToRoute(lm)}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={10} className="text-cyan-400" />
                  {lm.name.split(' ')[0]} {lm.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <div className="text-[10px] font-mono text-slate-400 mb-1 uppercase">
              Готові маршрути ({selectedCity === 'kyiv' ? 'Київ' : selectedCity === 'zaporizhzhia' ? 'Запоріжжя' : 'Вінниця'}):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(selectedCity === 'kyiv' ? KYIV_PRESET_ROUTES : selectedCity === 'zaporizhzhia' ? ZAPORIZHZHIA_PRESET_ROUTES : VINNYTSIA_PRESET_ROUTES).map(pr => (
                <button
                  key={pr.id}
                  onClick={() => loadPresetRoute(pr)}
                  className="text-[10px] text-left p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950 border border-slate-800 text-slate-300 font-bold transition-all truncate"
                >
                  {pr.name}
                </button>
              ))}
            </div>
          </div>

          {/* Waypoints List */}
          <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pr-1">
            {customRoute.map((wp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-[10px] font-mono bg-slate-900/60 p-1.5 rounded-lg border border-slate-800"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[9px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-slate-300 truncate">{wp.name}</span>
                </div>
                <button
                  onClick={() => removeWaypoint(idx)}
                  className="text-slate-500 hover:text-red-400 p-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setShowRoutePlanner(false);
                if (!isAutopilot) toggleAutopilot();
              }}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30"
            >
              <Zap size={14} />
              <span>СТАРТ FSD (F)</span>
            </button>

            <button
              onClick={handleClearRoute}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
              title="Очистити маршрут"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ================= MINIMAP (RADAR: VINNYTSIA / ZAPORIZHZHIA) ================= */}
      <div className="absolute top-20 right-4 z-20 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col items-center">
        <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1 flex items-center gap-1">
          <span>{selectedCity === 'kyiv' ? '🏛️ РАДАР: КИЇВ' : selectedCity === 'zaporizhzhia' ? '⚡ РАДАР: ЗАПОРІЖЖЯ' : '📍 РАДАР: ВІННИЦЯ'}</span>
        </div>

        {/* Radar Map Canvas */}
        <div className="relative w-36 h-36 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
          {selectedCity === 'kyiv' ? (
            <>
              {/* Dnipro River on the East */}
              <div className="absolute top-0 right-0 w-8 h-full bg-cyan-700/60" />
              <div className="absolute bottom-1 right-1 text-[6.5px] font-mono text-cyan-200">р. Дніпро</div>

              {/* Trukhaniv Island */}
              <div className="absolute top-[28%] right-0.5 w-6 h-12 bg-emerald-800/80 rounded-sm border border-emerald-500/50 flex flex-col items-center justify-center">
                <span className="text-[5.5px] font-bold text-amber-300 font-mono">Труханів</span>
              </div>

              {/* Khreshchatyk Boulevard (Vertical Main Road) */}
              <div className="absolute top-2 left-[44%] w-3.5 h-[86%] bg-slate-600/90 border-x border-slate-500" />
              <div className="absolute top-0.5 left-[30%] text-[6.5px] font-mono text-slate-300">Хрещатик</div>

              {/* Maidan Nezalezhnosti (Center) */}
              <div className="absolute top-1/2 left-[44%] -translate-y-1/2 -translate-x-1/2 flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white animate-pulse" />
                <span className="text-[6.5px] font-bold text-amber-300 font-mono">Майдан</span>
              </div>

              {/* Golden Gate (West) */}
              <div className="absolute top-[56%] left-2 flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full bg-amber-600 border border-white" />
                <span className="text-[6px] text-amber-200 font-mono">Золоті В.</span>
              </div>

              {/* Poshtova Sq / Podil (North-East) */}
              <div className="absolute top-2 right-8 flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400 border border-white" />
                <span className="text-[6px] text-cyan-200 font-mono">Поділ</span>
              </div>
            </>
          ) : selectedCity === 'zaporizhzhia' ? (
            <>
              {/* Dnipro River Channel */}
              <div className="absolute top-0 left-[24%] w-12 h-full bg-cyan-700/60" />
              <div className="absolute bottom-1 left-1 text-[7px] font-mono text-cyan-200">р. Дніпро</div>

              {/* DniproHES Dam */}
              <div className="absolute top-[32%] left-[12%] w-18 h-3.5 bg-slate-400 border-y border-amber-300 flex items-center justify-center">
                <span className="text-[6.5px] font-black text-slate-950 font-mono">ГЕС</span>
              </div>

              {/* Khortytsia Island */}
              <div className="absolute top-[48%] left-[20%] w-10 h-14 bg-emerald-800/80 rounded-sm border border-emerald-500/50 flex flex-col items-center justify-center">
                <span className="text-[6.5px] font-bold text-amber-300 font-mono">Січ</span>
              </div>

              {/* Preobrazhensky Bridge */}
              <div className="absolute top-[58%] left-[28%] w-10 h-2 bg-slate-400 border-x border-cyan-300" />

              {/* Soborny Avenue */}
              <div className="absolute top-0 right-3.5 w-3 h-full bg-slate-600/90 border-x border-slate-500" />
              <div className="absolute top-1 right-0 text-[6.5px] font-mono text-slate-300 px-0.5">Соборний</div>

              {/* Festivalska Square dot */}
              <div className="absolute top-[28%] right-4 w-2 h-2 rounded-full bg-amber-400 border border-white" />
            </>
          ) : (
            <>
              {/* Pivdennyi Buh River */}
              <div className="absolute top-[50%] left-0 w-full h-7 bg-cyan-600/60 -translate-y-1/2" />
              <div className="absolute top-[46%] left-0 text-[8px] font-mono text-cyan-200 px-1">П. Буг</div>

              {/* Central Bridge */}
              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-4 h-9 bg-slate-400 border-x border-cyan-300" />

              {/* Vinnytsia Water Tower marker (Вежа) */}
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white animate-pulse" />
                <span className="text-[7px] font-bold text-red-300 font-mono">Вежа</span>
              </div>

              {/* Roshen Fountain marker */}
              <div className="absolute top-[50%] right-2 flex flex-col items-center -translate-y-1/2">
                <div className="w-2 h-2 rounded-full bg-purple-400 border border-white" />
                <span className="text-[6.5px] text-purple-300 font-mono">Рошен</span>
              </div>
            </>
          )}

          {/* Player Car Dot */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full bg-yellow-400 border-2 border-slate-950 shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
            style={{
              left: `${50 + (telemetry.carX / (selectedCity === 'zaporizhzhia' ? 320 : selectedCity === 'kyiv' ? 280 : 240)) * 100}%`,
              top: `${50 + (telemetry.carZ / (selectedCity === 'zaporizhzhia' ? 320 : selectedCity === 'kyiv' ? 280 : 240)) * 100}%`
            }}
          />
        </div>
      </div>

      {/* ================= BOTTOM INSTRUMENT CLUSTER & DAMAGE HUD ================= */}
      <div className="relative z-20 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-wrap items-end justify-between gap-4">
        {/* Vehicle Health & Speedometer */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl">
          {/* Health / Integrity Bar */}
          <div className="min-w-[130px]">
            <div className="flex justify-between text-[10px] font-mono mb-1 font-bold">
              <span className="text-slate-400">МІЦНІСТЬ КУЗОВА:</span>
              <span className={telemetry.health > 50 ? 'text-emerald-400' : telemetry.health > 25 ? 'text-amber-400' : 'text-red-500'}>
                {telemetry.health}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-150 ${
                  telemetry.health > 50 ? 'bg-emerald-500' : telemetry.health > 25 ? 'bg-amber-500' : 'bg-red-600 animate-pulse'
                }`}
                style={{ width: `${telemetry.health}%` }}
              />
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          {/* Speed Indicator */}
          <div className="text-center min-w-[70px]">
            <div className="text-3xl font-black font-mono tracking-tight text-white drop-shadow">
              {telemetry.speedKmh}
            </div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
              КМ / ГОД
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          {/* Gear Indicator */}
          <div className="text-center min-w-[45px]">
            <div className="text-2xl font-black font-mono text-cyan-300">
              {telemetry.gear}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              ПЕРЕДАЧА
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          {/* Speed Limiter: 1: 50, 2: 100, 3: 200, 4: 300, 0: MAX */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono font-bold">
              <span className="text-slate-400">ОБМЕЖУВАЧ ШВИДКОСТІ:</span>
              <span className={speedLimit ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                {speedLimit ? `${speedLimit} км/год` : 'БЕЗ МЕЖ'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSetSpeedLimit(50)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  speedLimit === 50
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/40 scale-105'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-cyan-500/60'
                }`}
                title="1 кнопка: Максимум 50 км/год (Клавіша 1)"
              >
                <span className="text-[9px] opacity-75 mr-0.5">[1]</span>50
              </button>
              <button
                onClick={() => handleSetSpeedLimit(100)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  speedLimit === 100
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/40 scale-105'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-cyan-500/60'
                }`}
                title="2 кнопка: Максимум 100 км/год (Клавіша 2)"
              >
                <span className="text-[9px] opacity-75 mr-0.5">[2]</span>100
              </button>
              <button
                onClick={() => handleSetSpeedLimit(200)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  speedLimit === 200
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/40 scale-105'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-amber-500/60'
                }`}
                title="3 кнопка: Максимум 200 км/год (Клавіша 3)"
              >
                <span className="text-[9px] opacity-75 mr-0.5">[3]</span>200
              </button>
              <button
                onClick={() => handleSetSpeedLimit(300)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  speedLimit === 300
                    ? 'bg-rose-500 text-white border-rose-300 shadow-md shadow-rose-500/40 scale-105'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-rose-500/60'
                }`}
                title="4 кнопка: Максимум 300 км/год (Клавіша 4)"
              >
                <span className="text-[9px] opacity-75 mr-0.5">[4]</span>300
              </button>
              <button
                onClick={() => handleSetSpeedLimit(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                  speedLimit === null
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/40'
                    : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:border-purple-500/60'
                }`}
                title="Без обмежень: Повний газ (Клавіша 0)"
              >
                <span className="text-[9px] opacity-75 mr-0.5">[0]</span>MAX
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Controls Guide */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
          <span>Керування: </span>
          {activeInterior ? (
            <>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">W/A/S/D</kbd> Рух
              <kbd className="px-2 py-0.5 bg-amber-900/80 rounded border border-amber-500 text-amber-200 font-bold animate-pulse">E / Enter: Дія</kbd>
              <kbd className="px-2 py-0.5 bg-red-900/80 rounded border border-red-500 text-rose-200 font-bold">Q / Клік: Удар 👊</kbd>
              <kbd className="px-2 py-0.5 bg-cyan-900/80 rounded border border-cyan-400 text-cyan-200 font-bold">C: Екран ⛶</kbd>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">ESC: Вихід</kbd>
            </>
          ) : isHumanOnFoot ? (
            <>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">W/A/S/D</kbd> Рух
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold">Shift / Space: Біг</kbd>
              <kbd className="px-2 py-0.5 bg-blue-900/80 rounded border border-blue-500 text-cyan-200 font-bold">1-7: Зброя</kbd>
              <kbd className="px-2 py-0.5 bg-emerald-900/80 rounded border border-emerald-500 text-yellow-200 font-bold">8-0: ЗСУ ППО</kbd>
              <kbd className="px-2 py-0.5 bg-red-900/80 rounded border border-red-500 text-rose-200 font-bold">Q / ЛКМ: Атака</kbd>
              <kbd className="px-2 py-0.5 bg-blue-900/90 rounded border border-cyan-400 text-cyan-200 font-bold">P: Телефон 📱</kbd>
              <kbd className="px-2 py-0.5 bg-cyan-900/80 rounded border border-cyan-400 text-cyan-200 font-bold">C: Екран ⛶</kbd>
              <kbd className="px-2 py-0.5 bg-emerald-900/80 rounded border border-emerald-400 text-emerald-200 font-bold">T: Чат 💬</kbd>
              <kbd className="px-2 py-0.5 bg-indigo-900/80 rounded border border-indigo-400 text-indigo-200 font-bold">TAB: Гравці 👥</kbd>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-bold">X: Камера</kbd>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-indigo-300 font-bold">E</kbd> Сісти в авто
              {nearMilitaryBase && (
                <kbd className="px-2 py-0.5 bg-emerald-900/80 rounded border border-yellow-400 text-yellow-300 font-bold animate-pulse">F: База ЗСУ 🪖</kbd>
              )}
              {nearPoliceStation && (
                <kbd className="px-2 py-0.5 bg-blue-900/80 rounded border border-blue-400 text-yellow-300 font-bold animate-pulse">F: Поліція 102</kbd>
              )}
              {nearGunShop && (
                <kbd className="px-2 py-0.5 bg-red-900/80 rounded border border-red-500 text-rose-200 font-bold animate-pulse">F: Зброя 🔫</kbd>
              )}
              {nearStore && (
                <kbd className="px-2 py-0.5 bg-red-900/80 rounded border border-red-500 text-amber-200 font-bold animate-pulse">F / Enter: Магазин</kbd>
              )}
              {nearHousing && (
                <kbd className="px-2 py-0.5 bg-emerald-900/80 rounded border border-emerald-500 text-emerald-200 font-bold animate-pulse">F / Enter: Житло</kbd>
              )}
            </>
          ) : (
            <>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">W / ↑</kbd> Газ
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">S / ↓</kbd> Гальма
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">A / D</kbd> Поворот
              <kbd className="px-2 py-0.5 bg-blue-900/90 rounded border border-cyan-400 text-cyan-200 font-bold">P: Телефон 📱</kbd>
              <kbd className="px-2 py-0.5 bg-cyan-900/80 rounded border border-cyan-400 text-cyan-200 font-bold">C: Екран ⛶</kbd>
              <kbd className="px-2 py-0.5 bg-emerald-900/80 rounded border border-emerald-400 text-emerald-200 font-bold">T: Чат 💬</kbd>
              <kbd className="px-2 py-0.5 bg-indigo-900/80 rounded border border-indigo-400 text-indigo-200 font-bold">TAB: Гравці 👥</kbd>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-bold">X: Камера</kbd>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-indigo-300 font-bold">E</kbd> Вийти пішки
              {(isDrivingTank || isDrivingMilitaryCar) && (
                <kbd className="px-2 py-0.5 bg-red-900/90 rounded border border-yellow-400 text-yellow-200 font-bold animate-pulse">Space / Q: Постріл гармати 💥</kbd>
              )}
              {isDrivingPoliceCar && (
                <kbd className="px-2 py-0.5 bg-blue-900/90 rounded border border-red-500 text-yellow-300 font-bold animate-pulse">G: Сирена 🚨</kbd>
              )}
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-400 font-bold">V</kbd> Авто-Тяга
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-blue-400 font-bold">F</kbd> FSD
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">1-4</kbd> Ліміт
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold">SPACE</kbd> Дрифт
              <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-300 font-bold">R</kbd> Ремонт
            </>
          )}
        </div>

        {/* On-Screen Touch / Mouse Pedals & Combat Buttons */}
        <div className="flex items-center gap-2">
          {/* Tactical Weapon Selector Bar (1: Кулаки, 2: Тайзер, 3: Пістолет, 4: Наручники, 5: Балончик, 6: Кийок, 7: Дробовик) */}
          {isHumanOnFoot && (
            <div className="flex items-center gap-1 bg-slate-950/95 border border-blue-500/50 p-1 rounded-xl shadow-lg">
              <button
                onClick={() => handleEquipWeapon('fists')}
                className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  equippedWeapon === 'fists'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-300 hover:text-white'
                }`}
                title="Кулаки [1] (Ближній бій)"
              >
                <span>👊 [1]</span>
              </button>

              <button
                onClick={() => handleEquipWeapon('taser')}
                className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  equippedWeapon === 'taser'
                    ? 'bg-yellow-400 text-slate-950 shadow-md font-black ring-2 ring-yellow-200'
                    : isPolice || ownedWeapons.includes('taser')
                    ? 'bg-slate-900 text-yellow-300 hover:text-yellow-200'
                    : 'bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title={isPolice || ownedWeapons.includes('taser') ? 'Тайзер [2] (Паралізує на 4с)' : 'Тайзер (Потрібно придбати або вступити до поліції)'}
              >
                <span>⚡ [2]</span>
              </button>

              <button
                onClick={() => handleEquipWeapon('pistol')}
                className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  equippedWeapon === 'pistol'
                    ? 'bg-red-500 text-white shadow-md font-black ring-2 ring-red-300'
                    : isPolice || ownedWeapons.includes('pistol')
                    ? 'bg-slate-900 text-red-400 hover:text-red-300'
                    : 'bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title={isPolice || ownedWeapons.includes('pistol') ? 'Пістолет [3] (45 шкоди)' : 'Пістолет (Придбайте у магазині зброї)'}
              >
                <span>🔫 [3]</span>
              </button>

              <button
                onClick={() => handleEquipWeapon('handcuffs')}
                className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  equippedWeapon === 'handcuffs'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black ring-2 ring-cyan-200'
                    : isPolice || ownedWeapons.includes('handcuffs')
                    ? 'bg-slate-900 text-cyan-300 hover:text-cyan-200'
                    : 'bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title={isPolice || ownedWeapons.includes('handcuffs') ? 'Наручники [4] (Арешт дебоширів)' : 'Наручники (Тільки для поліції)'}
              >
                <span>🔗 [4]</span>
              </button>

              {ownedWeapons.includes('spray') && (
                <button
                  onClick={() => handleEquipWeapon('spray')}
                  className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    equippedWeapon === 'spray'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black ring-2 ring-emerald-200'
                      : 'bg-slate-900 text-emerald-300 hover:text-emerald-200'
                  }`}
                  title="Газовий балончик Терен-4М [5]"
                >
                  <span>💨 [5]</span>
                </button>
              )}

              {ownedWeapons.includes('baton') && (
                <button
                  onClick={() => handleEquipWeapon('baton')}
                  className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    equippedWeapon === 'baton'
                      ? 'bg-amber-600 text-white shadow-md font-black ring-2 ring-amber-300'
                      : 'bg-slate-900 text-amber-300 hover:text-amber-200'
                  }`}
                  title="Гумовий кийок ПР-73 [6]"
                >
                  <span>🦯 [6]</span>
                </button>
              )}

              {ownedWeapons.includes('shotgun') && (
                <button
                  onClick={() => handleEquipWeapon('shotgun')}
                  className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    equippedWeapon === 'shotgun'
                      ? 'bg-rose-600 text-white shadow-md font-black ring-2 ring-rose-300'
                      : 'bg-slate-900 text-rose-400 hover:text-rose-300'
                  }`}
                  title="Помповий дробовик Hatsan Escort [7]"
                >
                  <span>💥 [7]</span>
                </button>
              )}

              {/* Armed Forces of Ukraine (ЗСУ) Anti-Air Weapons */}
              <button
                onClick={() => handleEquipWeapon('ak74')}
                className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  equippedWeapon === 'ak74'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black ring-2 ring-emerald-200'
                    : isArmy || ownedWeapons.includes('ak74')
                    ? 'bg-slate-900 text-emerald-300 hover:text-emerald-200'
                    : 'bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title={isArmy || ownedWeapons.includes('ak74') ? 'АК-74 «Калаш» 5.45мм [8] (Черги по «Шахедах»)' : 'АК-74 (Тільки для бійців ЗСУ)'}
              >
                <span>🔫 [8]</span>
              </button>

              <button
                onClick={() => handleEquipWeapon('stinger')}
                className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  equippedWeapon === 'stinger'
                    ? 'bg-yellow-500 text-slate-950 shadow-md font-black ring-2 ring-yellow-200'
                    : isArmy || ownedWeapons.includes('stinger')
                    ? 'bg-slate-900 text-yellow-300 hover:text-yellow-200'
                    : 'bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title={isArmy || ownedWeapons.includes('stinger') ? 'ПЗРК «Stinger» / ППО [9] (Збиття дронів з 1 ракети)' : 'ПЗРК (Тільки для бійців ЗСУ)'}
              >
                <span>🚀 [9]</span>
              </button>

              <button
                onClick={() => handleEquipWeapon('drone')}
                className={`px-2.5 h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  equippedWeapon === 'drone'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black ring-2 ring-cyan-200'
                    : isArmy || ownedWeapons.includes('drone')
                    ? 'bg-slate-900 text-cyan-300 hover:text-cyan-200'
                    : 'bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title={isArmy || ownedWeapons.includes('drone') ? 'Пульт FPV-дрона [0] (Запуск дрона-камікадзе)' : 'FPV-дрон (Тільки для бійців ЗСУ)'}
              >
                <span>🎮 [0]</span>
              </button>
            </div>
          )}

          {/* Attack / Weapon Action Button */}
          {(isHumanOnFoot || activeInterior) && (
            <button
              onClick={handlePunch}
              className={`px-4 h-12 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg select-none border ${
                equippedWeapon === 'taser'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-300 shadow-yellow-500/40 text-slate-950'
                  : equippedWeapon === 'pistol'
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 border-red-400 shadow-red-500/40'
                  : equippedWeapon === 'handcuffs'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 border-cyan-400 shadow-cyan-500/40'
                  : equippedWeapon === 'spray'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-700 border-emerald-400 shadow-emerald-500/40'
                  : equippedWeapon === 'baton'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-700 border-amber-400 shadow-amber-500/40'
                  : equippedWeapon === 'shotgun'
                  ? 'bg-gradient-to-r from-rose-700 to-red-900 border-rose-400 shadow-rose-500/40'
                  : equippedWeapon === 'ak74'
                  ? 'bg-gradient-to-r from-emerald-700 to-green-900 border-emerald-400 shadow-emerald-500/40'
                  : equippedWeapon === 'stinger'
                  ? 'bg-gradient-to-r from-yellow-600 to-amber-800 border-yellow-300 shadow-yellow-500/40 text-slate-950'
                  : equippedWeapon === 'drone'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 border-cyan-300 shadow-cyan-500/40 text-white'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border-red-400 shadow-red-500/40'
              }`}
              title="Атакувати або використати спорядження (Q або ЛКМ)"
            >
              <span className="text-base">
                {equippedWeapon === 'taser'
                  ? '⚡'
                  : equippedWeapon === 'pistol'
                  ? '🔫'
                  : equippedWeapon === 'handcuffs'
                  ? '🔗'
                  : equippedWeapon === 'spray'
                  ? '💨'
                  : equippedWeapon === 'baton'
                  ? '🦯'
                  : equippedWeapon === 'shotgun'
                  ? '💥'
                  : equippedWeapon === 'ak74'
                  ? '🔫'
                  : equippedWeapon === 'stinger'
                  ? '🚀'
                  : equippedWeapon === 'drone'
                  ? '🎮'
                  : '👊'}
              </span>
              <span>
                {equippedWeapon === 'taser'
                  ? '[Q] ТАЙЗЕР'
                  : equippedWeapon === 'pistol'
                  ? '[Q] ПОСТРІЛ'
                  : equippedWeapon === 'handcuffs'
                  ? '[Q] АРЕШТ'
                  : equippedWeapon === 'spray'
                  ? '[Q] БАЛОНЧИК'
                  : equippedWeapon === 'baton'
                  ? '[Q] КИЙОК'
                  : equippedWeapon === 'shotgun'
                  ? '[Q] ДРОБОВИК'
                  : equippedWeapon === 'ak74'
                  ? '[Q] ЧЕРГА АК-74'
                  : equippedWeapon === 'stinger'
                  ? '[Q] РАКЕТА ППО'
                  : equippedWeapon === 'drone'
                  ? '[Q] СТАРТ FPV'
                  : '[Q] УДАР'}
              </span>
            </button>
          )}

          {/* Police Siren & Lights Button (When driving police patrol car) */}
          {!isHumanOnFoot && isDrivingPoliceCar && (
            <button
              onClick={handleToggleSiren}
              className={`px-4 h-12 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg select-none border ${
                isSirenOn
                  ? 'bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 text-white border-white animate-pulse shadow-blue-500/60'
                  : 'bg-slate-900 border-blue-500/60 text-blue-300 hover:bg-slate-800'
              }`}
              title="Увімкнути/вимкнути сирену та спецсигнали 102 (Клавіша G)"
            >
              <span className="text-base">🚨</span>
              <span>[G] СИРЕНА {isSirenOn ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Tank 125mm Cannon or Kozak AA Turret Fire Button */}
          {!isHumanOnFoot && (isDrivingTank || isDrivingMilitaryCar) && (
            <button
              onClick={fireTankCannon}
              className={`px-4 h-12 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg select-none border ${
                isDrivingTank
                  ? 'bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-slate-950 border-white shadow-amber-500/60 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-cyan-400 shadow-teal-500/60'
              }`}
              title="Залп з бойової гармати 125мм або зенітної турелі по «Шахедах» (Клавіша Space або Q)"
            >
              <span className="text-base">{isDrivingTank ? '💥' : '⚡'}</span>
              <span>{isDrivingTank ? '[ПРОБІЛ/Q] ЗАЛП ТАНКА' : '[ПРОБІЛ/Q] ТУРЕЛЬ ДШК'}</span>
            </button>
          )}

          {/* Interior Exit Button */}
          {activeInterior && (
            <button
              onClick={handleExitInterior}
              className="px-3.5 h-12 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md select-none"
              title="Вийти на вулицю (ESC)"
            >
              <DoorOpen size={16} className="text-yellow-400" />
              <span>ВИЙТИ [ESC]</span>
            </button>
          )}

          {/* Interior Interaction Button */}
          {activeInterior && nearInteriorInteract && (
            <button
              onClick={() => handleInteriorInteraction(nearInteriorInteract)}
              className="px-4 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-amber-500/40 animate-bounce select-none border border-white"
            >
              {nearInteriorInteract.type === 'bed' ? <BedDouble size={16} /> : nearInteriorInteract.type === 'tv' ? <Tv size={16} /> : <Utensils size={16} />}
              <span>{nearInteriorInteract.name} [E]</span>
            </button>
          )}

          {/* Quick Exit/Enter Car Button */}
          {!activeInterior && (
            <button
              onClick={handleToggleExitEnterCar}
              className={`px-3.5 h-12 rounded-xl border font-bold text-xs flex items-center justify-center active:scale-95 transition-all shadow-md select-none ${
                isHumanOnFoot
                  ? canEnterCar
                    ? 'bg-emerald-600 border-emerald-300 text-white animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                  : 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300 hover:bg-indigo-900'
              }`}
              title={isHumanOnFoot ? 'Сісти в авто (E)' : 'Вийти з авто (E)'}
            >
              {isHumanOnFoot ? (canEnterCar ? '🚗 СІСТИ [E]' : '🚶 ПІШКИ') : '🚶 ВИЙТИ [E]'}
            </button>
          )}

          {/* Quick Supermarket Open Button when near */}
          {!activeInterior && nearStore && (
            <button
              onClick={handleOpenStore}
              className="px-3.5 h-12 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs flex items-center gap-1 active:scale-95 transition-all shadow-lg shadow-red-500/40 animate-bounce select-none"
              title="Відкрити супермаркет"
            >
              <ShoppingBag size={14} />
              <span>🛒 {nearStore.brand === 'atb' ? 'АТБ' : 'СІЛЬПО'}</span>
            </button>
          )}

          {/* Quick Housing Open Button when near */}
          {!activeInterior && nearHousing && (
            <button
              onClick={handleOpenHousing}
              className="px-3.5 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center gap-1 active:scale-95 transition-all shadow-lg shadow-emerald-500/40 animate-bounce select-none"
              title="Відкрити меню житла"
            >
              <Home size={14} />
              <span>🏠 {ownedProperties.includes(nearHousing.id) ? 'МІЙ ДІМ' : 'КУПИТИ ЗА ₴100'}</span>
            </button>
          )}

          {/* Quick Police Station Open Button when near */}
          {!activeInterior && nearPoliceStation && (
            <button
              onClick={handleOpenPoliceStation}
              className="px-3.5 h-12 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-black text-xs flex items-center gap-1 active:scale-95 transition-all shadow-lg shadow-blue-500/40 animate-bounce select-none border border-cyan-400"
              title="Відкрити меню Головного Управління Поліції"
            >
              <Shield size={14} className="text-yellow-300" />
              <span>ПОЛІЦІЯ 102</span>
            </button>
          )}

          {/* Quick Military Base Open Button when near */}
          {!activeInterior && nearMilitaryBase && (
            <button
              onClick={() => setActiveMilitaryBase(true)}
              className="px-3.5 h-12 rounded-xl bg-gradient-to-r from-emerald-800 to-green-950 text-white font-black text-xs flex items-center gap-1 active:scale-95 transition-all shadow-lg shadow-yellow-500/40 animate-bounce select-none border border-yellow-400"
              title="Відкрити меню Військової частини ЗСУ та штабу ППО"
            >
              <span className="text-sm">🪖</span>
              <span>ШТАБ ЗСУ</span>
            </button>
          )}

          {/* Quick Gun Shop Open Button when near */}
          {!activeInterior && nearGunShop && (
            <button
              onClick={handleOpenGunShop}
              className="px-3.5 h-12 rounded-xl bg-gradient-to-r from-red-700 to-rose-900 text-white font-black text-xs flex items-center gap-1 active:scale-95 transition-all shadow-lg shadow-red-500/40 animate-bounce select-none border border-red-400"
              title="Відкрити магазин зброї «КАЛІБР»"
            >
              <Crosshair size={14} className="text-yellow-300" />
              <span>ЗБРОЯ 24/7</span>
            </button>
          )}

          {!activeInterior && (
            <button
              onClick={() => setShowRoutePlanner(!showRoutePlanner)}
              className="px-3.5 h-12 rounded-xl border border-amber-500/50 bg-slate-900 text-amber-300 font-bold text-xs flex items-center justify-center active:scale-95 transition-all shadow-md select-none"
              title="Прокласти маршрут"
            >
              🗺️ МАРШРУТ
            </button>
          )}

          {!activeInterior && (
            <button
              onClick={toggleAutoForward}
              className={`px-3.5 h-12 rounded-xl border font-bold text-xs flex items-center justify-center active:scale-95 transition-all shadow-md select-none ${
                isAutoForward
                  ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg shadow-emerald-500/40 animate-pulse'
                  : 'bg-slate-900 border-emerald-500/50 text-emerald-300 hover:bg-slate-800'
              }`}
              title="Авто-тяга вперед: машина сама їде вперед, а ви тільки рулюєте (Клавіша V)"
            >
              🚀 [V] АВТО-ТЯГА
            </button>
          )}

          {!activeInterior && (
            <button
              onClick={toggleAutopilot}
              className={`px-3.5 h-12 rounded-xl border font-bold text-xs flex items-center justify-center active:scale-95 transition-all shadow-md select-none ${
                isAutopilot
                  ? 'bg-blue-600 border-cyan-300 text-white animate-pulse'
                  : 'bg-slate-900 border-cyan-500/50 text-cyan-300'
              }`}
              title="Увімкнути/вимкнути автопілот Tesla FSD (Клавіша F)"
            >
              ⚡ FSD
            </button>
          )}

          <button
            onMouseDown={() => (keysRef.current.steerLeft = true)}
            onMouseUp={() => (keysRef.current.steerLeft = false)}
            onTouchStart={() => (keysRef.current.steerLeft = true)}
            onTouchEnd={() => (keysRef.current.steerLeft = false)}
            className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-lg flex items-center justify-center active:scale-95 transition-all shadow-md select-none"
          >
            ←
          </button>

          <button
            onMouseDown={() => (keysRef.current.steerRight = true)}
            onMouseUp={() => (keysRef.current.steerRight = false)}
            onTouchStart={() => (keysRef.current.steerRight = true)}
            onTouchEnd={() => (keysRef.current.steerRight = false)}
            className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-lg flex items-center justify-center active:scale-95 transition-all shadow-md select-none"
          >
            →
          </button>

          <button
            onMouseDown={() => (keysRef.current.brake = true)}
            onMouseUp={() => (keysRef.current.brake = false)}
            onTouchStart={() => (keysRef.current.brake = true)}
            onTouchEnd={() => (keysRef.current.brake = false)}
            className="px-3.5 h-12 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 font-bold text-xs flex items-center justify-center active:scale-95 transition-all shadow-md select-none"
          >
            🛑 ГАЛЬМО
          </button>

          <button
            onMouseDown={() => (keysRef.current.throttle = true)}
            onMouseUp={() => (keysRef.current.throttle = false)}
            onTouchStart={() => (keysRef.current.throttle = true)}
            onTouchEnd={() => (keysRef.current.throttle = false)}
            className="px-5 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-emerald-500/30 select-none"
          >
            🚀 ГАЗ
          </button>

          <button
            onMouseDown={() => (keysRef.current.handbrake = true)}
            onMouseUp={() => (keysRef.current.handbrake = false)}
            onTouchStart={() => (keysRef.current.handbrake = true)}
            onTouchEnd={() => (keysRef.current.handbrake = false)}
            className="px-3.5 h-12 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500 text-amber-300 font-black text-xs flex items-center justify-center active:scale-95 transition-all select-none"
          >
            💨 DRIFT
          </button>
        </div>
      </div>
    </div>
  );
}

// Camera positioning - smooth and rock-solid stable without shake
function updateDriveCamera(camera, carGroup, p, mode, isHumanOnFoot = false, human = null) {
  if (isHumanOnFoot && human && human.group && human.group.visible) {
    const yaw = human.yaw;
    const hPos = human.group.position;

    if (mode === 'top') {
      camera.position.set(hPos.x, hPos.y + 25, hPos.z - 0.1);
      camera.lookAt(hPos.x, 0.9, hPos.z);
    } else {
      // Third-person human chase camera
      const dist = 4.2;
      const height = 2.2;
      const camX = hPos.x - Math.sin(yaw) * dist;
      const camY = hPos.y + height;
      const camZ = hPos.z - Math.cos(yaw) * dist;

      camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.18);
      camera.lookAt(
        hPos.x + Math.sin(yaw) * 2,
        hPos.y + 1.3,
        hPos.z + Math.cos(yaw) * 2
      );
    }
    return;
  }

  const yaw = p.yaw;
  const carPos = carGroup.position;

  if (mode === 'cockpit') {
    const eyeX = carPos.x + Math.sin(yaw) * 0.2 - Math.cos(yaw) * 0.38;
    const eyeY = carPos.y + 1.25;
    const eyeZ = carPos.z + Math.cos(yaw) * 0.2 + Math.sin(yaw) * 0.38;

    camera.position.set(eyeX, eyeY, eyeZ);
    camera.lookAt(
      carPos.x + Math.sin(yaw) * 14,
      carPos.y + 1.0,
      carPos.z + Math.cos(yaw) * 14
    );
  } else if (mode === 'top') {
    camera.position.set(carPos.x, carPos.y + 40, carPos.z - 0.1);
    camera.lookAt(carPos.x, 0, carPos.z);
  } else {
    // Chase camera behind car - perfectly stable smooth tracking
    const dist = 7.5;
    const height = 2.8;

    const camX = carPos.x - Math.sin(yaw) * dist;
    const camY = carPos.y + height;
    const camZ = carPos.z - Math.cos(yaw) * dist;

    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.16);
    camera.lookAt(
      carPos.x + Math.sin(yaw) * 4,
      carPos.y + 1.2,
      carPos.z + Math.cos(yaw) * 4
    );
  }
}
