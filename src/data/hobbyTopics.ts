import { HobbyCategory } from '../types';

export interface HobbyTopicItem {
  id: string;
  name: string;
  category: HobbyCategory;
  subcategory: string;
  shortCode?: string;
  popular?: boolean;
}

export const HOBBY_TOPICS: HobbyTopicItem[] = [
  // ==========================================
  // FOOTBALL (SOCCER)
  // ==========================================
  // English Premier League
  { id: 'fb_arsenal', name: 'Arsenal', category: 'football', subcategory: 'Premier League', shortCode: 'ARS', popular: true },
  { id: 'fb_chelsea', name: 'Chelsea', category: 'football', subcategory: 'Premier League', shortCode: 'CHE', popular: true },
  { id: 'fb_liverpool', name: 'Liverpool', category: 'football', subcategory: 'Premier League', shortCode: 'LIV', popular: true },
  { id: 'fb_mancity', name: 'Manchester City', category: 'football', subcategory: 'Premier League', shortCode: 'MCI', popular: true },
  { id: 'fb_manutd', name: 'Manchester United', category: 'football', subcategory: 'Premier League', shortCode: 'MUN', popular: true },
  { id: 'fb_tottenham', name: 'Tottenham Hotspur', category: 'football', subcategory: 'Premier League', shortCode: 'TOT', popular: true },
  { id: 'fb_astonvilla', name: 'Aston Villa', category: 'football', subcategory: 'Premier League', shortCode: 'AVL' },
  { id: 'fb_newcastle', name: 'Newcastle United', category: 'football', subcategory: 'Premier League', shortCode: 'NEW' },
  { id: 'fb_brighton', name: 'Brighton & Hove Albion', category: 'football', subcategory: 'Premier League', shortCode: 'BHA' },
  { id: 'fb_westham', name: 'West Ham United', category: 'football', subcategory: 'Premier League', shortCode: 'WHU' },
  { id: 'fb_brentford', name: 'Brentford', category: 'football', subcategory: 'Premier League', shortCode: 'BRE' },
  { id: 'fb_crystalpalace', name: 'Crystal Palace', category: 'football', subcategory: 'Premier League', shortCode: 'CRY' },
  { id: 'fb_fulham', name: 'Fulham', category: 'football', subcategory: 'Premier League', shortCode: 'FUL' },
  { id: 'fb_everton', name: 'Everton', category: 'football', subcategory: 'Premier League', shortCode: 'EVE' },
  { id: 'fb_nottingham', name: 'Nottingham Forest', category: 'football', subcategory: 'Premier League', shortCode: 'NFO' },
  { id: 'fb_bournemouth', name: 'Bournemouth', category: 'football', subcategory: 'Premier League', shortCode: 'BOU' },
  { id: 'fb_wolves', name: 'Wolverhampton Wanderers', category: 'football', subcategory: 'Premier League', shortCode: 'WOL' },
  { id: 'fb_leicester', name: 'Leicester City', category: 'football', subcategory: 'Premier League', shortCode: 'LEI' },
  { id: 'fb_ipswich', name: 'Ipswich Town', category: 'football', subcategory: 'Premier League', shortCode: 'IPS' },
  { id: 'fb_southampton', name: 'Southampton', category: 'football', subcategory: 'Premier League', shortCode: 'SOU' },

  // Spanish La Liga
  { id: 'fb_realmadrid', name: 'Real Madrid', category: 'football', subcategory: 'La Liga', shortCode: 'RMA', popular: true },
  { id: 'fb_barcelona', name: 'Barcelona', category: 'football', subcategory: 'La Liga', shortCode: 'BAR', popular: true },
  { id: 'fb_atleticomadrid', name: 'Atletico Madrid', category: 'football', subcategory: 'La Liga', shortCode: 'ATM', popular: true },
  { id: 'fb_athleticbilbao', name: 'Athletic Bilbao', category: 'football', subcategory: 'La Liga', shortCode: 'ATH' },
  { id: 'fb_realsociedad', name: 'Real Sociedad', category: 'football', subcategory: 'La Liga', shortCode: 'RSO' },
  { id: 'fb_realbetis', name: 'Real Betis', category: 'football', subcategory: 'La Liga', shortCode: 'BET' },
  { id: 'fb_sevilla', name: 'Sevilla', category: 'football', subcategory: 'La Liga', shortCode: 'SEV' },
  { id: 'fb_villarreal', name: 'Villarreal', category: 'football', subcategory: 'La Liga', shortCode: 'VIL' },
  { id: 'fb_valencia', name: 'Valencia', category: 'football', subcategory: 'La Liga', shortCode: 'VAL' },
  { id: 'fb_girona', name: 'Girona', category: 'football', subcategory: 'La Liga', shortCode: 'GIR' },

  // Italian Serie A
  { id: 'fb_intermilan', name: 'Inter Milan', category: 'football', subcategory: 'Serie A', shortCode: 'INT', popular: true },
  { id: 'fb_acmilan', name: 'AC Milan', category: 'football', subcategory: 'Serie A', shortCode: 'MIL', popular: true },
  { id: 'fb_juventus', name: 'Juventus', category: 'football', subcategory: 'Serie A', shortCode: 'JUV', popular: true },
  { id: 'fb_napoli', name: 'Napoli', category: 'football', subcategory: 'Serie A', shortCode: 'NAP' },
  { id: 'fb_roma', name: 'AS Roma', category: 'football', subcategory: 'Serie A', shortCode: 'ROM' },
  { id: 'fb_lazio', name: 'Lazio', category: 'football', subcategory: 'Serie A', shortCode: 'LAZ' },
  { id: 'fb_atalanta', name: 'Atalanta', category: 'football', subcategory: 'Serie A', shortCode: 'ATA' },
  { id: 'fb_fiorentina', name: 'Fiorentina', category: 'football', subcategory: 'Serie A', shortCode: 'FIO' },

  // German Bundesliga
  { id: 'fb_bayern', name: 'Bayern Munich', category: 'football', subcategory: 'Bundesliga', shortCode: 'BAY', popular: true },
  { id: 'fb_dortmund', name: 'Borussia Dortmund', category: 'football', subcategory: 'Bundesliga', shortCode: 'BVB', popular: true },
  { id: 'fb_leverkusen', name: 'Bayer Leverkusen', category: 'football', subcategory: 'Bundesliga', shortCode: 'B04', popular: true },
  { id: 'fb_rbleipzig', name: 'RB Leipzig', category: 'football', subcategory: 'Bundesliga', shortCode: 'RBL' },
  { id: 'fb_frankfurt', name: 'Eintracht Frankfurt', category: 'football', subcategory: 'Bundesliga', shortCode: 'SGE' },
  { id: 'fb_stuttgart', name: 'VfB Stuttgart', category: 'football', subcategory: 'Bundesliga', shortCode: 'VFB' },

  // French Ligue 1
  { id: 'fb_psg', name: 'Paris Saint Germain', category: 'football', subcategory: 'Ligue 1', shortCode: 'PSG', popular: true },
  { id: 'fb_monaco', name: 'Monaco', category: 'football', subcategory: 'Ligue 1', shortCode: 'ASM' },
  { id: 'fb_marseille', name: 'Marseille', category: 'football', subcategory: 'Ligue 1', shortCode: 'OM' },
  { id: 'fb_lyon', name: 'Lyon', category: 'football', subcategory: 'Ligue 1', shortCode: 'OL' },
  { id: 'fb_lille', name: 'Lille', category: 'football', subcategory: 'Ligue 1', shortCode: 'LOSC' },

  // Other Global / Americas / Rest of Europe
  { id: 'fb_sporting', name: 'Sporting CP', category: 'football', subcategory: 'Primeira Liga', shortCode: 'SCP' },
  { id: 'fb_benfica', name: 'Benfica', category: 'football', subcategory: 'Primeira Liga', shortCode: 'SLB' },
  { id: 'fb_porto', name: 'Porto', category: 'football', subcategory: 'Primeira Liga', shortCode: 'FCP' },
  { id: 'fb_ajax', name: 'Ajax', category: 'football', subcategory: 'Eredivisie', shortCode: 'AJA' },
  { id: 'fb_feyenoord', name: 'Feyenoord', category: 'football', subcategory: 'Eredivisie', shortCode: 'FEY' },
  { id: 'fb_psv', name: 'PSV Eindhoven', category: 'football', subcategory: 'Eredivisie', shortCode: 'PSV' },
  { id: 'fb_celtic', name: 'Celtic', category: 'football', subcategory: 'Scottish Premiership', shortCode: 'CEL' },
  { id: 'fb_rangers', name: 'Rangers', category: 'football', subcategory: 'Scottish Premiership', shortCode: 'RAN' },
  { id: 'fb_galatasaray', name: 'Galatasaray', category: 'football', subcategory: 'Super Lig', shortCode: 'GAL' },
  { id: 'fb_fenerbahce', name: 'Fenerbahce', category: 'football', subcategory: 'Super Lig', shortCode: 'FEN' },
  { id: 'fb_intermiami', name: 'Inter Miami', category: 'football', subcategory: 'MLS', shortCode: 'MIA', popular: true },
  { id: 'fb_lagalaxy', name: 'LA Galaxy', category: 'football', subcategory: 'MLS', shortCode: 'LAG' },
  { id: 'fb_lafc', name: 'LAFC', category: 'football', subcategory: 'MLS', shortCode: 'LAFC' },
  { id: 'fb_alhilal', name: 'Al Hilal', category: 'football', subcategory: 'Saudi Pro League', shortCode: 'HIL' },
  { id: 'fb_alnassr', name: 'Al Nassr', category: 'football', subcategory: 'Saudi Pro League', shortCode: 'NAS' },
  { id: 'fb_flamengo', name: 'Flamengo', category: 'football', subcategory: 'Brasileirao', shortCode: 'FLA' },
  { id: 'fb_palmeiras', name: 'Palmeiras', category: 'football', subcategory: 'Brasileirao', shortCode: 'PAL' },
  { id: 'fb_riverplate', name: 'River Plate', category: 'football', subcategory: 'Primera Division', shortCode: 'RIV' },
  { id: 'fb_bocajuniors', name: 'Boca Juniors', category: 'football', subcategory: 'Primera Division', shortCode: 'BOC' },

  // ==========================================
  // BASKETBALL (NBA & INTERNATIONAL)
  // ==========================================
  // NBA Western Conference
  { id: 'bb_warriors', name: 'Golden State Warriors', category: 'basketball', subcategory: 'NBA West', shortCode: 'GSW', popular: true },
  { id: 'bb_lakers', name: 'Los Angeles Lakers', category: 'basketball', subcategory: 'NBA West', shortCode: 'LAL', popular: true },
  { id: 'bb_clippers', name: 'LA Clippers', category: 'basketball', subcategory: 'NBA West', shortCode: 'LAC' },
  { id: 'bb_suns', name: 'Phoenix Suns', category: 'basketball', subcategory: 'NBA West', shortCode: 'PHX', popular: true },
  { id: 'bb_kings', name: 'Sacramento Kings', category: 'basketball', subcategory: 'NBA West', shortCode: 'SAC' },
  { id: 'bb_mavericks', name: 'Dallas Mavericks', category: 'basketball', subcategory: 'NBA West', shortCode: 'DAL', popular: true },
  { id: 'bb_nuggets', name: 'Denver Nuggets', category: 'basketball', subcategory: 'NBA West', shortCode: 'DEN', popular: true },
  { id: 'bb_timberwolves', name: 'Minnesota Timberwolves', category: 'basketball', subcategory: 'NBA West', shortCode: 'MIN', popular: true },
  { id: 'bb_thunder', name: 'Oklahoma City Thunder', category: 'basketball', subcategory: 'NBA West', shortCode: 'OKC', popular: true },
  { id: 'bb_spurs', name: 'San Antonio Spurs', category: 'basketball', subcategory: 'NBA West', shortCode: 'SAS' },
  { id: 'bb_rockets', name: 'Houston Rockets', category: 'basketball', subcategory: 'NBA West', shortCode: 'HOU' },
  { id: 'bb_grizzlies', name: 'Memphis Grizzlies', category: 'basketball', subcategory: 'NBA West', shortCode: 'MEM' },
  { id: 'bb_pelicans', name: 'New Orleans Pelicans', category: 'basketball', subcategory: 'NBA West', shortCode: 'NOP' },
  { id: 'bb_trailblazers', name: 'Portland Trail Blazers', category: 'basketball', subcategory: 'NBA West', shortCode: 'POR' },
  { id: 'bb_jazz', name: 'Utah Jazz', category: 'basketball', subcategory: 'NBA West', shortCode: 'UTA' },

  // NBA Eastern Conference
  { id: 'bb_celtics', name: 'Boston Celtics', category: 'basketball', subcategory: 'NBA East', shortCode: 'BOS', popular: true },
  { id: 'bb_bucks', name: 'Milwaukee Bucks', category: 'basketball', subcategory: 'NBA East', shortCode: 'MIL', popular: true },
  { id: 'bb_knicks', name: 'New York Knicks', category: 'basketball', subcategory: 'NBA East', shortCode: 'NYK', popular: true },
  { id: 'bb_sixers', name: 'Philadelphia 76ers', category: 'basketball', subcategory: 'NBA East', shortCode: 'PHI', popular: true },
  { id: 'bb_heat', name: 'Miami Heat', category: 'basketball', subcategory: 'NBA East', shortCode: 'MIA', popular: true },
  { id: 'bb_cavaliers', name: 'Cleveland Cavaliers', category: 'basketball', subcategory: 'NBA East', shortCode: 'CLE' },
  { id: 'bb_pacers', name: 'Indiana Pacers', category: 'basketball', subcategory: 'NBA East', shortCode: 'IND' },
  { id: 'bb_magic', name: 'Orlando Magic', category: 'basketball', subcategory: 'NBA East', shortCode: 'ORL' },
  { id: 'bb_bulls', name: 'Chicago Bulls', category: 'basketball', subcategory: 'NBA East', shortCode: 'CHI' },
  { id: 'bb_hawks', name: 'Atlanta Hawks', category: 'basketball', subcategory: 'NBA East', shortCode: 'ATL' },
  { id: 'bb_nets', name: 'Brooklyn Nets', category: 'basketball', subcategory: 'NBA East', shortCode: 'BKN' },
  { id: 'bb_raptors', name: 'Toronto Raptors', category: 'basketball', subcategory: 'NBA East', shortCode: 'TOR' },
  { id: 'bb_pistons', name: 'Detroit Pistons', category: 'basketball', subcategory: 'NBA East', shortCode: 'DET' },
  { id: 'bb_hornets', name: 'Charlotte Hornets', category: 'basketball', subcategory: 'NBA East', shortCode: 'CHA' },
  { id: 'bb_wizards', name: 'Washington Wizards', category: 'basketball', subcategory: 'NBA East', shortCode: 'WAS' },

  // EuroLeague
  { id: 'bb_realmadrid_b', name: 'Real Madrid Baloncesto', category: 'basketball', subcategory: 'EuroLeague', shortCode: 'RMB' },
  { id: 'bb_panathinaikos', name: 'Panathinaikos', category: 'basketball', subcategory: 'EuroLeague', shortCode: 'PAO' },
  { id: 'bb_olympiacos', name: 'Olympiacos', category: 'basketball', subcategory: 'EuroLeague', shortCode: 'OLY' },
  { id: 'bb_barcelona_b', name: 'Barcelona Basket', category: 'basketball', subcategory: 'EuroLeague', shortCode: 'FCB' },
  { id: 'bb_fenerbahce_b', name: 'Fenerbahce Beko', category: 'basketball', subcategory: 'EuroLeague', shortCode: 'FBB' },

  // ==========================================
  // GAMING & ESPORTS
  // ==========================================
  { id: 'gm_valorant', name: 'Valorant', category: 'gaming', subcategory: 'Tactical Shooter', shortCode: 'VAL', popular: true },
  { id: 'gm_cs2', name: 'Counter Strike 2', category: 'gaming', subcategory: 'Tactical Shooter', shortCode: 'CS2', popular: true },
  { id: 'gm_lol', name: 'League of Legends', category: 'gaming', subcategory: 'MOBA', shortCode: 'LOL', popular: true },
  { id: 'gm_dota2', name: 'Dota 2', category: 'gaming', subcategory: 'MOBA', shortCode: 'DOTA', popular: true },
  { id: 'gm_apex', name: 'Apex Legends', category: 'gaming', subcategory: 'Battle Royale', shortCode: 'APEX', popular: true },
  { id: 'gm_fortnite', name: 'Fortnite', category: 'gaming', subcategory: 'Battle Royale', shortCode: 'FN', popular: true },
  { id: 'gm_cod', name: 'Call of Duty', category: 'gaming', subcategory: 'FPS', shortCode: 'COD', popular: true },
  { id: 'gm_overwatch2', name: 'Overwatch 2', category: 'gaming', subcategory: 'Hero Shooter', shortCode: 'OW2' },
  { id: 'gm_rocketleague', name: 'Rocket League', category: 'gaming', subcategory: 'Vehicular Soccer', shortCode: 'RL', popular: true },
  { id: 'gm_r6siege', name: 'Rainbow Six Siege', category: 'gaming', subcategory: 'Tactical Shooter', shortCode: 'R6' },
  { id: 'gm_eafc', name: 'EA Sports FC 25', category: 'gaming', subcategory: 'Sports', shortCode: 'FC25' },
  { id: 'gm_nba2k', name: 'NBA 2K25', category: 'gaming', subcategory: 'Sports', shortCode: '2K25' },
  { id: 'gm_tekken8', name: 'Tekken 8', category: 'gaming', subcategory: 'Fighting', shortCode: 'TK8' },
  { id: 'gm_sf6', name: 'Street Fighter 6', category: 'gaming', subcategory: 'Fighting', shortCode: 'SF6' },
  { id: 'gm_smash', name: 'Super Smash Bros', category: 'gaming', subcategory: 'Fighting', shortCode: 'SSB' },
  { id: 'gm_pubg', name: 'PUBG', category: 'gaming', subcategory: 'Battle Royale', shortCode: 'PUBG' },
  { id: 'gm_mobilelegends', name: 'Mobile Legends', category: 'gaming', subcategory: 'Mobile MOBA', shortCode: 'MLBB' },
  { id: 'gm_brawlstars', name: 'Brawl Stars', category: 'gaming', subcategory: 'Mobile Arena', shortCode: 'BS' },
  { id: 'gm_haloinfinite', name: 'Halo Infinite', category: 'gaming', subcategory: 'FPS', shortCode: 'HALO' },
  { id: 'gm_starcraft2', name: 'StarCraft II', category: 'gaming', subcategory: 'RTS', shortCode: 'SC2' },
  { id: 'gm_wow', name: 'World of Warcraft', category: 'gaming', subcategory: 'MMORPG', shortCode: 'WOW' },
  { id: 'gm_destiny2', name: 'Destiny 2', category: 'gaming', subcategory: 'Action MMO', shortCode: 'D2' },
  { id: 'gm_ffxiv', name: 'Final Fantasy XIV', category: 'gaming', subcategory: 'MMORPG', shortCode: 'FF14' },
  { id: 'gm_warframe', name: 'Warframe', category: 'gaming', subcategory: 'Action RPG', shortCode: 'WF' },
  { id: 'gm_helldivers2', name: 'Helldivers 2', category: 'gaming', subcategory: 'Cooperative Shooter', shortCode: 'HD2' },
  { id: 'gm_poe', name: 'Path of Exile', category: 'gaming', subcategory: 'Action RPG', shortCode: 'POE' },
  { id: 'gm_eldenring', name: 'Elden Ring', category: 'gaming', subcategory: 'Action RPG', shortCode: 'ER' },
  { id: 'gm_minecraft', name: 'Minecraft', category: 'gaming', subcategory: 'Sandbox', shortCode: 'MC' },
  { id: 'gm_gtaonline', name: 'GTA Online', category: 'gaming', subcategory: 'Open World', shortCode: 'GTA' },
  { id: 'gm_squadraid', name: 'Squad Raid', category: 'gaming', subcategory: 'Cooperative Missions', shortCode: 'RAID' },

  // ==========================================
  // CRYPTO & WEB3 ECOSYSTEMS
  // ==========================================
  // Nimiq Ecosystem (Highlighted)
  { id: 'cr_nimiqpos', name: 'Nimiq PoS', category: 'crypto', subcategory: 'Nimiq Ecosystem', shortCode: 'NIM', popular: true },
  { id: 'cr_nimiqstaking', name: 'Nimiq Staking', category: 'crypto', subcategory: 'Nimiq Ecosystem', shortCode: 'STAKE', popular: true },
  { id: 'cr_nimiqoasis', name: 'Nimiq Oasis Atomic Swap', category: 'crypto', subcategory: 'Nimiq Ecosystem', shortCode: 'OASIS', popular: true },
  { id: 'cr_nimiqpay', name: 'Nimiq Pay', category: 'crypto', subcategory: 'Nimiq Ecosystem', shortCode: 'PAY', popular: true },

  // Major Layer 1 Networks
  { id: 'cr_bitcoin', name: 'Bitcoin', category: 'crypto', subcategory: 'Layer 1', shortCode: 'BTC', popular: true },
  { id: 'cr_ethereum', name: 'Ethereum', category: 'crypto', subcategory: 'Layer 1', shortCode: 'ETH', popular: true },
  { id: 'cr_solana', name: 'Solana', category: 'crypto', subcategory: 'Layer 1', shortCode: 'SOL', popular: true },
  { id: 'cr_cardano', name: 'Cardano', category: 'crypto', subcategory: 'Layer 1', shortCode: 'ADA' },
  { id: 'cr_avalanche', name: 'Avalanche', category: 'crypto', subcategory: 'Layer 1', shortCode: 'AVAX' },
  { id: 'cr_near', name: 'Near Protocol', category: 'crypto', subcategory: 'Layer 1', shortCode: 'NEAR' },
  { id: 'cr_polkadot', name: 'Polkadot', category: 'crypto', subcategory: 'Layer 1', shortCode: 'DOT' },
  { id: 'cr_cosmos', name: 'Cosmos Hub', category: 'crypto', subcategory: 'Layer 1', shortCode: 'ATOM' },
  { id: 'cr_ton', name: 'Toncoin', category: 'crypto', subcategory: 'Layer 1', shortCode: 'TON' },
  { id: 'cr_sui', name: 'Sui Network', category: 'crypto', subcategory: 'Layer 1', shortCode: 'SUI' },
  { id: 'cr_aptos', name: 'Aptos', category: 'crypto', subcategory: 'Layer 1', shortCode: 'APT' },
  { id: 'cr_monero', name: 'Monero', category: 'crypto', subcategory: 'Privacy', shortCode: 'XMR' },
  { id: 'cr_kaspa', name: 'Kaspa', category: 'crypto', subcategory: 'Layer 1', shortCode: 'KAS' },

  // Layer 2 Scaling & Rollups
  { id: 'cr_polygon', name: 'Polygon', category: 'crypto', subcategory: 'Layer 2', shortCode: 'POL', popular: true },
  { id: 'cr_arbitrum', name: 'Arbitrum', category: 'crypto', subcategory: 'Layer 2', shortCode: 'ARB', popular: true },
  { id: 'cr_optimism', name: 'Optimism', category: 'crypto', subcategory: 'Layer 2', shortCode: 'OP' },
  { id: 'cr_base', name: 'Base Network', category: 'crypto', subcategory: 'Layer 2', shortCode: 'BASE', popular: true },
  { id: 'cr_zksync', name: 'zkSync Era', category: 'crypto', subcategory: 'Layer 2', shortCode: 'ZK' },
  { id: 'cr_starknet', name: 'Starknet', category: 'crypto', subcategory: 'Layer 2', shortCode: 'STRK' },

  // DeFi & Web3 Protocols
  { id: 'cr_chainlink', name: 'Chainlink', category: 'crypto', subcategory: 'Oracle & Infra', shortCode: 'LINK', popular: true },
  { id: 'cr_uniswap', name: 'Uniswap', category: 'crypto', subcategory: 'DeFi', shortCode: 'UNI' },
  { id: 'cr_aave', name: 'Aave', category: 'crypto', subcategory: 'DeFi Lending', shortCode: 'AAVE' },
  { id: 'cr_makerdao', name: 'MakerDAO', category: 'crypto', subcategory: 'DeFi Stablecoin', shortCode: 'MKR' },
  { id: 'cr_lido', name: 'Lido Staking', category: 'crypto', subcategory: 'Liquid Staking', shortCode: 'LDO' },
  { id: 'cr_halvingcycle', name: 'Halving Cycle Run', category: 'crypto', subcategory: 'Macro Milestones', shortCode: 'CYCLE' },
];

/**
 * Returns all topics for a given category.
 */
export const getTopicsByCategory = (category: HobbyCategory): HobbyTopicItem[] => {
  return HOBBY_TOPICS.filter((t) => t.category === category);
};

/**
 * Returns popular/featured topics for quick-pick pill buttons.
 */
export const getPopularTopics = (category: HobbyCategory): HobbyTopicItem[] => {
  const filtered = HOBBY_TOPICS.filter((t) => t.category === category && t.popular);
  if (filtered.length > 0) return filtered;
  return HOBBY_TOPICS.filter((t) => t.category === category).slice(0, 8);
};

/**
 * Returns unique subcategories for filtering within a hobby category.
 */
export const getSubcategories = (category: HobbyCategory): string[] => {
  const subs = new Set<string>();
  HOBBY_TOPICS.filter((t) => t.category === category).forEach((t) => {
    if (t.subcategory) subs.add(t.subcategory);
  });
  return Array.from(subs);
};

/**
 * Search topics across a category by query string (matching name, subcategory, or shortCode).
 */
export const searchTopics = (category: HobbyCategory, query: string): HobbyTopicItem[] => {
  const clean = query.trim().toLowerCase();
  if (!clean) return getTopicsByCategory(category);

  return HOBBY_TOPICS.filter(
    (t) =>
      t.category === category &&
      (t.name.toLowerCase().includes(clean) ||
        t.subcategory.toLowerCase().includes(clean) ||
        (t.shortCode && t.shortCode.toLowerCase().includes(clean)))
  );
};

/**
 * Legacy compatibility mapping of HobbyCategory -> string array of topic names.
 */
export const TOPIC_OPTIONS: Record<HobbyCategory, string[]> = {
  football: getTopicsByCategory('football').map((t) => t.name),
  basketball: getTopicsByCategory('basketball').map((t) => t.name),
  gaming: getTopicsByCategory('gaming').map((t) => t.name),
  crypto: getTopicsByCategory('crypto').map((t) => t.name),
};
