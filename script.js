/**
 * Netflix.AI - Core Javascript Engine
 * Handles Mood Mapping, API calls, Fallback Datasets, and Modal Controllers.
 */

// Global Configuration & State
const CONFIG = {
  DEFAULT_API_KEY: '8265bd1679663a7ea12ac168da84d2c8', // A stable public TMDb key (fallback default)
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/w1280',
  LOCAL_STORAGE_KEY: 'netflix_ai_api_key'
};

const state = {
  apiKey: localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || CONFIG.DEFAULT_API_KEY,
  isFallbackMode: false,
  activeTab: 'all', // 'all', 'movie', 'tv'
  currentQuery: '',
  searchResults: [],
  myList: JSON.parse(localStorage.getItem('netflix_ai_mylist')) || []
};

// Genre Code Mapping for TMDb API
const TMDb_GENRES = {
  movie: {
    action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
    drama: 18, family: 10751, fantasy: 14, history: 36, horror: 27,
    music: 10402, mystery: 9648, romance: 10749, scifi: 878,
    thriller: 53, tv_movie: 10770, war: 10752, western: 37
  },
  tv: {
    action_adventure: 10759, animation: 16, comedy: 35, crime: 80,
    documentary: 99, drama: 18, family: 10751, kids: 10762, mystery: 9648,
    news: 10763, reality: 10764, scifi_fantasy: 10765, soap: 10766,
    talk: 10767, war_politics: 10768, western: 37
  }
};

// Comprehensive Fallback Local Database (40 Curated Premium Titles)
const LOCAL_DATABASE = [
  {
    id: "l_1",
    title: "Interstellar",
    type: "movie",
    rating: 8.6,
    releaseYear: 2014,
    runtime: "2h 49m",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    moods: ["mind-blowing", "mind-bending", "emotional", "sci-fi", "adventure"],
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival in this mind-bending cosmic saga.",
    poster: "/gEU2Qv6157vKNc3qxp0V3zTYc7d.jpg",
    backdrop: "/xJHok70jZZ8JTy2ok76zK6vS26b.jpg",
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    status: "Released"
  },
  {
    id: "l_2",
    title: "Inception",
    type: "movie",
    rating: 8.8,
    releaseYear: 2010,
    runtime: "2h 28m",
    genres: ["Sci-Fi", "Action", "Thriller"],
    moods: ["mind-blowing", "mind-bending", "action", "thriller", "suspense"],
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "/edv5CZv0j09upOsy2Y6IwNM51Nt.jpg",
    backdrop: "/8ZMRsiqbLw876pqZjfsPTSBgR5A.jpg",
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
    tagline: "Your mind is the scene of the crime.",
    status: "Released"
  },
  {
    id: "l_3",
    title: "Stranger Things",
    type: "tv",
    rating: 8.7,
    releaseYear: 2016,
    runtime: "4 Seasons",
    genres: ["Sci-Fi", "Mystery", "Drama"],
    moods: ["binge-worthy", "suspense", "mystery", "sci-fi", "adventure"],
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster: "/49Wk21SSCui326305wR9qngrCHI.jpg",
    backdrop: "/56v2DnL5a4zrmVwNnAhgTy4l65V.jpg",
    trailerUrl: "https://www.youtube.com/embed/b9EkMc79ZSU",
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
    tagline: "One summer can change everything.",
    status: "Returning Series"
  },
  {
    id: "l_4",
    title: "Breaking Bad",
    type: "tv",
    rating: 9.5,
    releaseYear: 2008,
    runtime: "5 Seasons",
    genres: ["Crime", "Drama", "Thriller"],
    moods: ["binge-worthy", "dark", "crime", "thriller", "suspense"],
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.",
    poster: "/ztkUQvmg11a7mHG0xzSq6hx3e4o.jpg",
    backdrop: "/9fa5tCH14VmS6H242vO7rxWZ75c.jpg",
    trailerUrl: "https://www.youtube.com/embed/HhesaQXLuRY",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Bob Odenkirk"],
    tagline: "Change the equation.",
    status: "Ended"
  },
  {
    id: "l_5",
    title: "The Dark Knight",
    type: "movie",
    rating: 9.0,
    releaseYear: 2008,
    runtime: "2h 32m",
    genres: ["Action", "Crime", "Drama"],
    moods: ["dark", "action", "crime", "thriller", "suspense"],
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster: "/qJ2tWw75e1zQAwt4X5hb05kfRaa.jpg",
    backdrop: "/o86u02mKBwjl5ST1qq7l2z2iV5F.jpg",
    trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
    cast: ["Christian Bale", "Heath Ledger", "Gary Oldman", "Aaron Eckhart"],
    tagline: "Why So Serious?",
    status: "Released"
  },
  {
    id: "l_6",
    title: "Parasite",
    type: "movie",
    rating: 8.5,
    releaseYear: 2019,
    runtime: "2h 12m",
    genres: ["Thriller", "Drama", "Comedy"],
    moods: ["mind-blowing", "dark", "thriller", "suspense", "comedy"],
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster: "/7IiTT0wFlX62m27CcKfQ2STrKz1.jpg",
    backdrop: "/TU9HGth74oO8wJ6VwVAh66343G.jpg",
    trailerUrl: "https://www.youtube.com/embed/5xH0HfJHsaY",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    tagline: "Act like you own the place.",
    status: "Released"
  },
  {
    id: "l_7",
    title: "Shutter Island",
    type: "movie",
    rating: 8.2,
    releaseYear: 2010,
    runtime: "2h 18m",
    genres: ["Mystery", "Thriller", "Drama"],
    moods: ["mind-blowing", "mind-bending", "suspense", "mystery", "dark"],
    description: "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane on Shutter Island.",
    poster: "/4Iv95v1vN0t0494cc2ehfh2LEm7.jpg",
    backdrop: "/5ezG06aR26gB587216l8n26K18a.jpg",
    trailerUrl: "https://www.youtube.com/embed/5iaYLCip5Qk",
    cast: ["Leonardo DiCaprio", "Mark Ruffalo", "Ben Kingsley", "Michelle Williams"],
    tagline: "Someone is missing.",
    status: "Released"
  },
  {
    id: "l_8",
    title: "Spirited Away",
    type: "movie",
    rating: 8.5,
    releaseYear: 2001,
    runtime: "2h 5m",
    genres: ["Animation", "Fantasy", "Family"],
    moods: ["anime", "emotional", "adventure", "fantasy"],
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    poster: "/393mh1e0ptUGSRzW6151JyH6fOI.jpg",
    backdrop: "/m03qzXZY27Zfv2S20v7G7n7K6sa.jpg",
    trailerUrl: "https://www.youtube.com/embed/ByXuk9QqQkk",
    cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki", "Takashi Naito"],
    tagline: "Nothing that happens is ever forgotten, even if you can't remember it.",
    status: "Released"
  },
  {
    id: "l_9",
    title: "Whiplash",
    type: "movie",
    rating: 8.4,
    releaseYear: 2014,
    runtime: "1h 46m",
    genres: ["Drama", "Music"],
    moods: ["motivational", "emotional", "dark", "drama"],
    description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    poster: "/75OO42d5Y6498A6DZ63COJ6869n.jpg",
    backdrop: "/5y6qeeT826gVii7n6U4D9l3kF4c.jpg",
    trailerUrl: "https://www.youtube.com/embed/7d_jQC6WpT0",
    cast: ["Miles Teller", "J.K. Simmons", "Paul Reiser", "Melissa Benoist"],
    tagline: "Not quite my tempo.",
    status: "Released"
  },
  {
    id: "l_10",
    title: "The Conjuring",
    type: "movie",
    rating: 7.5,
    releaseYear: 2013,
    runtime: "1h 52m",
    genres: ["Horror", "Mystery", "Thriller"],
    moods: ["horror", "suspense", "mystery", "dark"],
    description: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.",
    poster: "/w9kR39yVtyisYfxgJwJUzM6m92Y.jpg",
    backdrop: "/gL8P2n84H65vH3n9e4zV8K42o2f.jpg",
    trailerUrl: "https://www.youtube.com/embed/k10ETZ42q5o",
    cast: ["Vera Farmiga", "Patrick Wilson", "Lili Taylor", "Ron Livingston"],
    tagline: "Based on the true case files of the Warrens.",
    status: "Released"
  },
  {
    id: "l_11",
    title: "La La Land",
    type: "movie",
    rating: 7.9,
    releaseYear: 2016,
    runtime: "2h 8m",
    genres: ["Romance", "Drama", "Music"],
    moods: ["romance", "emotional", "comedy"],
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    poster: "/uDO8zWDhfVn67nff2EWDee2n30v.jpg",
    backdrop: "/7e32L61o17W49j1a2D5tQ5tZ8e6.jpg",
    trailerUrl: "https://www.youtube.com/embed/0pdqf4Kj1n0",
    cast: ["Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt"],
    tagline: "Here's to the fools who dream.",
    status: "Released"
  },
  {
    id: "l_12",
    title: "Joker",
    type: "movie",
    rating: 8.2,
    releaseYear: 2019,
    runtime: "2h 2m",
    genres: ["Crime", "Thriller", "Drama"],
    moods: ["dark", "emotional", "crime", "suspense", "thriller"],
    description: "During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic figure.",
    poster: "/udDcl707h26n8JD13msN3tcl36q.jpg",
    backdrop: "/n6bGeebv606core462KZu86jTee.jpg",
    trailerUrl: "https://www.youtube.com/embed/zAGVQLHvwOY",
    cast: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy"],
    tagline: "Put on a happy face.",
    status: "Released"
  },
  {
    id: "l_13",
    title: "Pulp Fiction",
    type: "movie",
    rating: 8.9,
    releaseYear: 1994,
    runtime: "2h 34m",
    genres: ["Crime", "Thriller"],
    moods: ["dark", "crime", "comedy", "thriller"],
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    poster: "/d5i26jDw1u914t6iIAL47cKiJie.jpg",
    backdrop: "/sua7t5W1fQA265gnLQ6g7URJexw.jpg",
    trailerUrl: "https://www.youtube.com/embed/s7EdQ4FqbhY",
    cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis"],
    tagline: "Just because you are a character doesn't mean that you have character.",
    status: "Released"
  },
  {
    id: "l_14",
    title: "Game of Thrones",
    type: "tv",
    rating: 9.2,
    releaseYear: 2011,
    runtime: "8 Seasons",
    genres: ["Sci-Fi", "Drama", "Action"],
    moods: ["binge-worthy", "dark", "adventure", "suspense", "action"],
    description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for thousands of years.",
    poster: "/1XS1nmg23tW2u1iOI5tFmLR58nC.jpg",
    backdrop: "/zZqp4n7jCuC25l2vTSn4G77tX7q.jpg",
    trailerUrl: "https://www.youtube.com/embed/gcTkFNrL21I",
    cast: ["Emilia Clarke", "Kit Harington", "Peter Dinklage", "Lena Headey"],
    tagline: "Winter is Coming.",
    status: "Ended"
  },
  {
    id: "l_15",
    title: "Demon Slayer: Mugen Train",
    type: "movie",
    rating: 8.3,
    releaseYear: 2020,
    runtime: "1h 57m",
    genres: ["Animation", "Action", "Fantasy"],
    moods: ["anime", "action", "emotional", "adventure"],
    description: "A boy goes on a journey to become a demon slayer after his family is slaughtered, boarding the Mugen Train to face a powerful threat alongside his companions.",
    poster: "/h8g6IcSgWl7C3R6m1lq64jY4636.jpg",
    backdrop: "/xPpXYjR7v2t0wa6LhIqc0VEgkBX.jpg",
    trailerUrl: "https://www.youtube.com/embed/ATJYac_dORk",
    cast: ["Natsuki Hanae", "Akari Kito", "Yoshitsugu Matsuoka", "Hiro Shimono"],
    tagline: "With your blade, bring an end to the nightmare.",
    status: "Released"
  },
  {
    id: "l_16",
    title: "The Pursuit of Happyness",
    type: "movie",
    rating: 8.0,
    releaseYear: 2006,
    runtime: "1h 57m",
    genres: ["Drama", "Biography"],
    moods: ["motivational", "emotional", "drama"],
    description: "A struggling salesman takes custody of his son as he's poised to begin a life-changing professional career, navigating homelessness in the process.",
    poster: "/41e5U1A7Wz2G986xR8P1x7X5tT3.jpg",
    backdrop: "/4Qn1e6878vH0vMscQc4R8Z4j28a.jpg",
    trailerUrl: "https://www.youtube.com/embed/DMOBlEcRuw8",
    cast: ["Will Smith", "Jaden Smith", "Thandiwe Newton", "Brian Howe"],
    tagline: "What would you do to defend your dreams?",
    status: "Released"
  },
  {
    id: "l_17",
    title: "Knives Out",
    type: "movie",
    rating: 7.9,
    releaseYear: 2019,
    runtime: "2h 10m",
    genres: ["Comedy", "Mystery", "Thriller"],
    moods: ["mystery", "comedy", "suspense", "thriller"],
    description: "A detective investigates the death of the patriarch of an eccentric, combative family, tracing secrets that lead down a twisted road.",
    poster: "/3Kgfb6vS7j11KY2RM26h7aq6j43.jpg",
    backdrop: "/kMe4Tk1-z16V78t6iAL47cKiJie.jpg",
    trailerUrl: "https://www.youtube.com/embed/qGqiHJTsRkQ",
    cast: ["Daniel Craig", "Ana de Armas", "Chris Evans", "Jamie Lee Curtis"],
    tagline: "Everyone has a motive. No one has a clue.",
    status: "Released"
  },
  {
    id: "l_18",
    title: "Chernobyl",
    type: "tv",
    rating: 9.4,
    releaseYear: 2019,
    runtime: "1 Season",
    genres: ["Drama", "History"],
    moods: ["binge-worthy", "dark", "emotional", "suspense"],
    description: "In April 1986, an explosion at the Chernobyl nuclear power plant in the USSR becomes one of the world's worst man-made catastrophes, telling the stories of the heroes who fought to contain it.",
    poster: "/hlLXt2t76zxJgKPN8z6Zu652jrf.jpg",
    backdrop: "/uL6J62x1rt5BCEuiuiuhN86jTee.jpg",
    trailerUrl: "https://www.youtube.com/embed/s9APLXM9Ei8",
    cast: ["Jared Harris", "Stellan Skarsgård", "Emily Watson", "Paul Ritter"],
    tagline: "What is the cost of lies?",
    status: "Ended"
  },
  {
    id: "l_19",
    title: "Squid Game",
    type: "tv",
    rating: 8.7,
    releaseYear: 2021,
    runtime: "1 Season",
    genres: ["Action", "Thriller", "Drama"],
    moods: ["binge-worthy", "dark", "action", "suspense", "thriller"],
    description: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
    poster: "/d5NXSklXj0t0494cc2ehfh2LEm7.jpg",
    backdrop: "/yGP32L61o17W49j1a2D5tQ5tZ8e6.jpg",
    trailerUrl: "https://www.youtube.com/embed/oqxAJKy0R4A",
    cast: ["Lee Jung-jae", "Park Hae-soo", "Wi Ha-jun", "Jung Ho-yeon"],
    tagline: "45.6 Billion Won is Child's Play.",
    status: "Returning Series"
  },
  {
    id: "l_20",
    title: "Money Heist",
    type: "tv",
    rating: 8.3,
    releaseYear: 2017,
    runtime: "5 Seasons",
    genres: ["Crime", "Action", "Thriller"],
    moods: ["binge-worthy", "action", "crime", "suspense", "thriller"],
    description: "To carry out the biggest heist in history, a mysterious man called The Professor recruits a band of eight robbers who take hostages in the Royal Mint of Spain.",
    poster: "/reEMJA1vgiAWyo9FW87re2nB5u1.jpg",
    backdrop: "/tbVZ38zW6151JyH6fOIsU7kFsFk.jpg",
    trailerUrl: "https://www.youtube.com/embed/hUXE1c27g8M",
    cast: ["Úrsula Corberó", "Álvaro Morte", "Itziar Ituño", "Pedro Alonso"],
    tagline: "The rebellion starts here.",
    status: "Ended"
  },
  {
    id: "l_21",
    title: "Peaky Blinders",
    type: "tv",
    rating: 8.8,
    releaseYear: 2013,
    runtime: "6 Seasons",
    genres: ["Crime", "Drama"],
    moods: ["binge-worthy", "dark", "crime", "suspense"],
    description: "A gangster family epic set in 1919 Birmingham, England; centered on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby.",
    poster: "/v3Q75z86d9Z13tQ5v7FpSjC8Z3.jpg",
    backdrop: "/zNq4Cptw71fQA265gnLQ6g7URJex.jpg",
    trailerUrl: "https://www.youtube.com/embed/oVzVdvGIC38",
    cast: ["Cillian Murphy", "Helen McCrory", "Paul Anderson", "Tom Hardy"],
    tagline: "By order of the Peaky Blinders.",
    status: "Ended"
  },
  {
    id: "l_22",
    title: "Black Mirror",
    type: "tv",
    rating: 8.3,
    releaseYear: 2011,
    runtime: "6 Seasons",
    genres: ["Sci-Fi", "Drama", "Thriller"],
    moods: ["binge-worthy", "mind-blowing", "mind-bending", "dark", "sci-fi"],
    description: "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide.",
    poster: "/7BgZ7294cc2ehfh2LEm7v3Q75z8.jpg",
    backdrop: "/q3s86d9Z13tQ5v7FpSjC8Z3zZqp4.jpg",
    trailerUrl: "https://www.youtube.com/embed/v7P_1G507d0",
    cast: ["Daniel Lapaine", "Hannah John-Kamen", "Michaela Coel", "Jesse Plemons"],
    tagline: "The future is bright.",
    status: "Returning Series"
  },
  {
    id: "l_23",
    title: "Arcane",
    type: "tv",
    rating: 9.0,
    releaseYear: 2021,
    runtime: "1 Season",
    genres: ["Animation", "Action", "Sci-Fi"],
    moods: ["anime", "binge-worthy", "action", "emotional", "sci-fi"],
    description: "Amidst the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of war between magic technologies and clashing convictions.",
    poster: "/fqld52rw1u914t6iIAL47cKiJie.jpg",
    backdrop: "/uD4K3V5b7k8C0Cptw7l55nS1QjD.jpg",
    trailerUrl: "https://www.youtube.com/embed/fXmAurh012s",
    cast: ["Hailee Steinfeld", "Ella Purnell", "Kevin Alejandro", "Harry Lloyd"],
    tagline: "Enter the Playground.",
    status: "Returning Series"
  },
  {
    id: "l_24",
    title: "Gladiator",
    type: "movie",
    rating: 8.2,
    releaseYear: 2000,
    runtime: "2h 35m",
    genres: ["Action", "Drama", "Adventure"],
    moods: ["action", "motivational", "emotional", "adventure"],
    description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    poster: "/ty8mg67r41e5U1A7Wz2G986xR8P.jpg",
    backdrop: "/owK1yxDpw5cOW1yxDpw5c.jpg",
    trailerUrl: "https://www.youtube.com/embed/owK1yxDpw5c",
    cast: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen", "Oliver Reed"],
    tagline: "What we do in life echoes in eternity.",
    status: "Released"
  },
  {
    id: "l_25",
    title: "Blade Runner 2049",
    type: "movie",
    rating: 8.0,
    releaseYear: 2017,
    runtime: "2h 44m",
    genres: ["Sci-Fi", "Mystery", "Thriller"],
    moods: ["mind-blowing", "mind-bending", "dark", "sci-fi", "thriller"],
    description: "A new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    poster: "/gKaZ86d9Z13tQ5v7FpSjC8Z3zZq.jpg",
    backdrop: "/lh5lbzYNFxr4t4xS25vTRn9oujM.jpg",
    trailerUrl: "https://www.youtube.com/embed/gCcx85zVzQA",
    cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Robin Wright"],
    tagline: "There's still a page left.",
    status: "Released"
  },
  {
    id: "l_26",
    title: "The Notebook",
    type: "movie",
    rating: 7.9,
    releaseYear: 2004,
    runtime: "2h 3m",
    genres: ["Romance", "Drama"],
    moods: ["romance", "emotional", "drama"],
    description: "An epic love story centered around an older man who reads aloud to a woman with Alzheimer's from a faded notebook that contains their history.",
    poster: "/2L2Gj3h2l2r8x7x6tT34zK5t4q6.jpg",
    backdrop: "/qOM5g5A86d9Z13tQ5v7FpSjC8Z3.jpg",
    trailerUrl: "https://www.youtube.com/embed/yDJIcYE32NU",
    cast: ["Ryan Gosling", "Rachel McAdams", "James Garner", "Gena Rowlands"],
    tagline: "Behind every great love is a great story.",
    status: "Released"
  },
  {
    id: "l_27",
    title: "Fight Club",
    type: "movie",
    rating: 8.4,
    releaseYear: 1999,
    runtime: "2h 19m",
    genres: ["Drama", "Thriller"],
    moods: ["mind-blowing", "mind-bending", "dark", "thriller", "suspense"],
    description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much, much more.",
    poster: "/pB8BFlw7ee4g7jUjiR3u44wt4Xq.jpg",
    backdrop: "/l55nS1QjD4K3V5b7k8C0Cptw7.jpg",
    trailerUrl: "https://www.youtube.com/embed/qtRydYt94To",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter", "Meat Loaf"],
    tagline: "Mischief. Mayhem. Soap.",
    status: "Released"
  },
  {
    id: "l_28",
    title: "Avengers: Endgame",
    type: "movie",
    rating: 8.3,
    releaseYear: 2019,
    runtime: "3h 1m",
    genres: ["Action", "Adventure", "Sci-Fi"],
    moods: ["action", "adventure", "sci-fi", "motivational"],
    description: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions.",
    poster: "/or06bq40bSfgmXMh64tw21QC2iF.jpg",
    backdrop: "/7RyHsO4yHMmFU7CDeBFg46sCTox.jpg",
    trailerUrl: "https://www.youtube.com/embed/TcMBFSGZo1A",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"],
    tagline: "Part of the journey is the end.",
    status: "Released"
  },
  {
    id: "l_29",
    title: "Your Name",
    type: "movie",
    rating: 8.5,
    releaseYear: 2016,
    runtime: "1h 46m",
    genres: ["Animation", "Romance", "Drama"],
    moods: ["anime", "romance", "emotional", "mind-bending"],
    description: "Two strangers find themselves linked in a bizarre way. When a connection is formed, will distance be the only thing to keep them apart?",
    poster: "/q719jCxv2t0wa6LhIqc0VEgkBX.jpg",
    backdrop: "/m03qzXZY27Zfv2S20v7G7n7K6sa.jpg",
    trailerUrl: "https://www.youtube.com/embed/ByXuk9QqQkk",
    cast: ["Ryunosuke Kamiki", "Mone Kamishiraishi", "Ryo Narita", "Aoi Yuki"],
    tagline: "I am looking for you, whom I haven't met yet.",
    status: "Released"
  },
  {
    id: "l_30",
    title: "The Office",
    type: "tv",
    rating: 9.0,
    releaseYear: 2005,
    runtime: "9 Seasons",
    genres: ["Comedy"],
    moods: ["comedy", "binge-worthy"],
    description: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    poster: "/q7c952rw1u914t6iIAL47cKiJie.jpg",
    backdrop: "/9fa5tCH14VmS6H242vO7rxWZ75c.jpg",
    trailerUrl: "https://www.youtube.com/embed/LHOtME2DLyA",
    cast: ["Steve Carell", "Rainn Wilson", "John Krasinski", "Jenna Fischer"],
    tagline: "Our business is paper. But our passion is people.",
    status: "Ended"
  },
  {
    id: "l_31",
    title: "Friends",
    type: "tv",
    rating: 8.9,
    releaseYear: 1994,
    runtime: "10 Seasons",
    genres: ["Comedy"],
    moods: ["comedy", "binge-worthy"],
    description: "Follow the lives of six reckless adults living in Manhattan, as they indulge in adventures which make their lives both troublesome and happening.",
    poster: "/f496tBEqR2T284qX6J34NqZq71a.jpg",
    backdrop: "/l05nS1QjD4K3V5b7k8C0Cptw7.jpg",
    trailerUrl: "https://www.youtube.com/embed/hDNNmeeJs1Q",
    cast: ["Jennifer Aniston", "Courteney Cox", "Lisa Kudrow", "Matt LeBlanc", "Matthew Perry", "David Schwimmer"],
    tagline: "I'll be there for you.",
    status: "Ended"
  },
  {
    id: "l_32",
    title: "Brooklyn Nine-Nine",
    type: "tv",
    rating: 8.2,
    releaseYear: 2013,
    runtime: "8 Seasons",
    genres: ["Comedy", "Crime"],
    moods: ["comedy", "binge-worthy", "crime"],
    description: "A comedy following the exploits of Detective Jake Peralta and his diverse, lovable colleagues as they police the NYPD's 99th Precinct.",
    poster: "/hg9q0w6151JyH6fOI.jpg",
    backdrop: "/zNq4Cptw71fQA265gnLQ6g7URJex.jpg",
    trailerUrl: "https://www.youtube.com/embed/Hi10n19bAHA",
    cast: ["Andy Samberg", "Stephanie Beatriz", "Terry Crews", "Melissa Fumero", "Andre Braugher"],
    tagline: "Platoon. Precision. Police.",
    status: "Ended"
  },
  {
    id: "l_33",
    title: "Superbad",
    type: "movie",
    rating: 7.6,
    releaseYear: 2007,
    runtime: "1h 53m",
    genres: ["Comedy"],
    moods: ["comedy"],
    description: "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.",
    poster: "/ek8g6IcSgWl7C3R6m1lq64jY4636.jpg",
    backdrop: "/owK1yxDpw5cOW1yxDpw5c.jpg",
    trailerUrl: "https://www.youtube.com/embed/2L2Gj3h2l2r",
    cast: ["Jonah Hill", "Michael Cera", "Christopher Mintz-Plasse", "Emma Stone"],
    tagline: "It is fast. It is furious. It is Superbad.",
    status: "Released"
  },
  {
    id: "l_34",
    title: "The Hangover",
    type: "movie",
    rating: 7.7,
    releaseYear: 2009,
    runtime: "1h 40m",
    genres: ["Comedy"],
    moods: ["comedy"],
    description: "Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night and the bachelor missing.",
    poster: "/ulgeT2t76zxJgKPN8z6Zu652jrf.jpg",
    backdrop: "/tbVZ38zW6151JyH6fOIsU7kFsFk.jpg",
    trailerUrl: "https://www.youtube.com/embed/tcdUjPFZUIg",
    cast: ["Bradley Cooper", "Ed Helms", "Zach Galifianakis", "Justin Bartha"],
    tagline: "Some guys just can't handle Vegas.",
    status: "Released"
  },
  {
    id: "l_35",
    title: "Get Out",
    type: "movie",
    rating: 7.6,
    releaseYear: 2017,
    runtime: "1h 44m",
    genres: ["Horror", "Mystery", "Thriller"],
    moods: ["horror", "dark", "suspense", "mystery"],
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception eventually reaches a boiling point.",
    poster: "/t4aL8WbN1Nl6pZc6b541i3wz6.jpg",
    backdrop: "/xPpXYjR7v2t0wa6LhIqc0VEgkBX.jpg",
    trailerUrl: "https://www.youtube.com/embed/DnOktS1n9sE",
    cast: ["Daniel Kaluuya", "Allison Williams", "Catherine Keener", "Bradley Whitford"],
    tagline: "Just because you're invited, doesn't mean you're welcome.",
    status: "Released"
  },
  {
    id: "l_36",
    title: "Hereditary",
    type: "movie",
    rating: 7.3,
    releaseYear: 2018,
    runtime: "2h 7m",
    genres: ["Horror", "Mystery", "Drama"],
    moods: ["horror", "dark", "suspense", "mystery"],
    description: "When the matriarch of the Graham family passes away, her daughter and grandchildren begin to unravel cryptic and increasingly terrifying secrets about their ancestry.",
    poster: "/ulgeT2t76zxJgKPN8z6Zu652jrg.jpg",
    backdrop: "/gL8P2n84H65vH3n9e4zV8K42o2f.jpg",
    trailerUrl: "https://www.youtube.com/embed/V6wWKNij_1M",
    cast: ["Toni Collette", "Alex Wolff", "Milly Shapiro", "Gabriel Byrne"],
    tagline: "Every family tree hides a secret.",
    status: "Released"
  },
  {
    id: "l_37",
    title: "A Quiet Place",
    type: "movie",
    rating: 7.4,
    releaseYear: 2018,
    runtime: "1h 30m",
    genres: ["Horror", "Sci-Fi", "Thriller"],
    moods: ["horror", "suspense", "sci-fi"],
    description: "A family must navigate their lives in silence to avoid mysterious creatures that hunt by sound.",
    poster: "/n6bGeebv606core462KZu86jTee.jpg",
    backdrop: "/TU9HGth74oO8wJ6VwVAh66343G.jpg",
    trailerUrl: "https://www.youtube.com/embed/WR7cc5t7tv8",
    cast: ["Emily Blunt", "John Krasinski", "Millicent Simmonds", "Noah Jupe"],
    tagline: "If they hear you, they hunt you.",
    status: "Released"
  },
  {
    id: "l_38",
    title: "The Haunting of Hill House",
    type: "tv",
    rating: 8.6,
    releaseYear: 2018,
    runtime: "1 Season",
    genres: ["Horror", "Mystery", "Drama"],
    moods: ["horror", "dark", "suspense", "binge-worthy"],
    description: "Flashing between past and present, a fractured family confronts haunting memories of their old home and the terrifying events that drove them from it.",
    poster: "/7BgZ7294cc2ehfh2LEm7v3Q75z8.jpg",
    backdrop: "/uL6J62x1rt5BCEuiuiuhN86jTee.jpg",
    trailerUrl: "https://www.youtube.com/embed/G9OzG53VwFw",
    cast: ["Michiel Huisman", "Carla Gugino", "Timothy Hutton", "Elizabeth Reaser"],
    tagline: "Some houses are born bad.",
    status: "Ended"
  },
  {
    id: "l_39",
    title: "About Time",
    type: "movie",
    rating: 7.8,
    releaseYear: 2013,
    runtime: "2h 3m",
    genres: ["Romance", "Drama", "Fantasy"],
    moods: ["romance", "emotional", "comedy"],
    description: "At the age of 21, Tim discovers he can travel in time and change what happens and has happened in his own life. His decision to make his world a better place by getting a girlfriend turns out to be not as easy as you would think.",
    poster: "/or06bq40bSfgmXMh64tw21QC2iG.jpg",
    backdrop: "/7RyHsO4yHMmFU7CDeBFg46sCTox.jpg",
    trailerUrl: "https://www.youtube.com/embed/T7A810duHvw",
    cast: ["Domhnall Gleeson", "Rachel McAdams", "Bill Nighy", "Tom Hollander"],
    tagline: "A new comedy about love and time travel.",
    status: "Released"
  },
  {
    id: "l_40",
    title: "Pride & Prejudice",
    type: "movie",
    rating: 7.8,
    releaseYear: 2005,
    runtime: "2h 9m",
    genres: ["Romance", "Drama"],
    moods: ["romance", "emotional"],
    description: "Sparks fly when spirited Elizabeth Bennet meets single, rich, and proud Mr. Darcy. But Mr. Darcy reluctantly finds himself falling in love with a woman beneath his class. Can each overcome their own pride and prejudice?",
    poster: "/uDO8zWDhfVn67nff2EWDee2n30v.jpg",
    backdrop: "/7e32L61o17W49j1a2D5tQ5tZ8e6.jpg",
    trailerUrl: "https://www.youtube.com/embed/1dYv5u6v55g",
    cast: ["Keira Knightley", "Matthew Macfadyen", "Brenda Blethyn", "Donald Sutherland"],
    tagline: "A great love story.",
    status: "Released"
  },
  {
    id: "l_41",
    title: "Normal People",
    type: "tv",
    rating: 8.6,
    releaseYear: 2020,
    runtime: "1 Season",
    genres: ["Romance", "Drama"],
    moods: ["romance", "emotional", "binge-worthy"],
    description: "Marianne and Connell weave in and out of each other's lives as they grow up in Ireland, exploring the complexities of intimacy and young love.",
    poster: "/41e5U1A7Wz2G986xR8P1x7X5tT3.jpg",
    backdrop: "/4Qn1e6878vH0vMscQc4R8Z4j28a.jpg",
    trailerUrl: "https://www.youtube.com/embed/x1JQuWqO3F8",
    cast: ["Daisy Edgar-Jones", "Paul Mescal"],
    tagline: "You can't escape your first love.",
    status: "Ended"
  },
  {
    id: "l_42",
    title: "Crash Landing on You",
    type: "tv",
    rating: 8.7,
    releaseYear: 2019,
    runtime: "1 Season",
    genres: ["Romance", "Comedy", "Drama"],
    moods: ["romance", "emotional", "comedy", "binge-worthy"],
    description: "A South Korean heiress accidentally paraglides into North Korea and into the life of an army officer, who decides he will help her hide.",
    poster: "/reEMJA1vgiAWyo9FW87re2nB5u2.jpg",
    backdrop: "/tbVZ38zW6151JyH6fOIsU7kFsFk.jpg",
    trailerUrl: "https://www.youtube.com/embed/ePJy7sT4tFk",
    cast: ["Hyun Bin", "Son Ye-jin", "Seo Ji-hye", "Kim Jung-hyun"],
    tagline: "Love knows no borders.",
    status: "Ended"
  },
  {
    id: "l_43",
    title: "Attack on Titan",
    type: "tv",
    rating: 9.0,
    releaseYear: 2013,
    runtime: "4 Seasons",
    genres: ["Animation", "Action", "Fantasy"],
    moods: ["anime", "action", "dark", "binge-worthy"],
    description: "After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
    poster: "/hTP1Hb1g0qHz8SDByk3JoQgdc1L.jpg",
    backdrop: "/5ezG06aR26gB587216l8n26K18a.jpg",
    trailerUrl: "https://www.youtube.com/embed/LHtdkW5__GI",
    cast: ["Yuki Kaji", "Yui Ishikawa", "Marina Inoue", "Hiroshi Kamiya"],
    tagline: "To win, we must fight.",
    status: "Ended"
  },
  {
    id: "l_44",
    title: "Death Note",
    type: "tv",
    rating: 9.0,
    releaseYear: 2006,
    runtime: "1 Season",
    genres: ["Animation", "Mystery", "Thriller"],
    moods: ["anime", "mystery", "dark", "binge-worthy"],
    description: "An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written in it.",
    poster: "/t8PgD1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop: "/xJHok70jZZ8JTy2ok76zK6vS26b.jpg",
    trailerUrl: "https://www.youtube.com/embed/NlJZ-YgAt-c",
    cast: ["Mamoru Miyano", "Kappei Yamaguchi", "Shido Nakamura", "Aya Hirano"],
    tagline: "Justice will prevail.",
    status: "Ended"
  },
  {
    id: "l_45",
    title: "Spider-Man: Into the Spider-Verse",
    type: "movie",
    rating: 8.4,
    releaseYear: 2018,
    runtime: "1h 57m",
    genres: ["Animation", "Action", "Adventure"],
    moods: ["action", "adventure", "motivational"],
    description: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
    poster: "/iiIKo131002mKBwjl5ST1qq7l2z.jpg",
    backdrop: "/owK1yxDpw5cOW1yxDpw5c.jpg",
    trailerUrl: "https://www.youtube.com/embed/g4HbzUK12dk",
    cast: ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld", "Mahershala Ali"],
    tagline: "More than one wears the mask.",
    status: "Released"
  },
  {
    id: "l_46",
    title: "The Matrix",
    type: "movie",
    rating: 8.7,
    releaseYear: 1999,
    runtime: "2h 16m",
    genres: ["Sci-Fi", "Action"],
    moods: ["sci-fi", "action", "mind-bending", "mind-blowing"],
    description: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
    poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop: "/3u42u986lh514Z9xR8P1x7X5tT3.jpg",
    trailerUrl: "https://www.youtube.com/embed/vKQi3bgb1Co",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"],
    tagline: "Welcome to the Real World.",
    status: "Released"
  },
  {
    id: "l_47",
    title: "Dark",
    type: "tv",
    rating: 8.7,
    releaseYear: 2017,
    runtime: "3 Seasons",
    genres: ["Sci-Fi", "Mystery", "Thriller"],
    moods: ["sci-fi", "mystery", "mind-bending", "dark", "binge-worthy"],
    description: "A family saga with a supernatural twist, set in a German town, where the disappearance of two young children exposes the relationships among four families.",
    poster: "/56v2DnL5a4zrmVwNnAhgTy4l65V.jpg",
    backdrop: "/TU9HGth74oO8wJ6VwVAh66343G.jpg",
    trailerUrl: "https://www.youtube.com/embed/ESRgLqy3fhk",
    cast: ["Louis Hofmann", "Oliver Masucci", "Jördis Triebel", "Maja Schöne"],
    tagline: "Everything is connected.",
    status: "Ended"
  },
  {
    id: "l_48",
    title: "The Prestige",
    type: "movie",
    rating: 8.5,
    releaseYear: 2006,
    runtime: "2h 10m",
    genres: ["Mystery", "Drama", "Sci-Fi"],
    moods: ["mystery", "mind-bending", "mind-blowing", "suspense"],
    description: "After a tragic accident, two stage magicians in 1890s London engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.",
    poster: "/bdN4Cptw71fQA265gnLQ6g7URJex.jpg",
    backdrop: "/zZqp4n7jCuC25l2vTSn4G77tX7q.jpg",
    trailerUrl: "https://www.youtube.com/embed/ObGgJ1Gk8t4",
    cast: ["Hugh Jackman", "Christian Bale", "Scarlett Johansson", "Michael Caine"],
    tagline: "Are You Watching Closely?",
    status: "Released"
  },
  {
    id: "l_49",
    title: "Se7en",
    type: "movie",
    rating: 8.6,
    releaseYear: 1995,
    runtime: "2h 7m",
    genres: ["Crime", "Mystery", "Thriller"],
    moods: ["crime", "mystery", "dark", "suspense"],
    description: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
    poster: "/6Kgfb6vS7j11KY2RM26h7aq6j43.jpg",
    backdrop: "/kMe4Tk1-z16V78t6iAL47cKiJie.jpg",
    trailerUrl: "https://www.youtube.com/embed/znmZoKE5c0w",
    cast: ["Brad Pitt", "Morgan Freeman", "Gwyneth Paltrow", "Kevin Spacey"],
    tagline: "Seven deadly sins. Seven ways to die.",
    status: "Released"
  },
  {
    id: "l_50",
    title: "Fleabag",
    type: "tv",
    rating: 8.7,
    releaseYear: 2016,
    runtime: "2 Seasons",
    genres: ["Comedy", "Drama"],
    moods: ["comedy", "emotional", "binge-worthy"],
    description: "A dry-witted woman, known only as Fleabag, navigates life and love in London while trying to cope with a recent tragedy.",
    poster: "/7BgZ7294cc2ehfh2LEm7v3Q75z8.jpg",
    backdrop: "/qOM5g5A86d9Z13tQ5v7FpSjC8Z3.jpg",
    trailerUrl: "https://www.youtube.com/embed/I5Uv6cb9YF4",
    cast: ["Phoebe Waller-Bridge", "Sian Clifford", "Olivia Colman", "Andrew Scott"],
    tagline: "I have a horrible feeling I'm a greedy, perverted, selfish, apathetic, cynical, depraved, morally-bankrupt woman.",
    status: "Ended"
  }
];

// Unsplash Placeholder Gradients (used as ultimate fallbacks for image onError)
const UNSPLASH_GENRE_IMAGES = {
  'Action': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80',
  'Thriller': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
  'Horror': 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=500&q=80',
  'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80',
  'Sci-Fi': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80',
  'Mystery': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&q=80',
  'Animation': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
  'Adventure': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=80',
  'Comedy': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80',
  'Drama': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80',
  'Crime': 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&q=80',
  'default': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80'
};

// --- Intelligent Search Parsing & Mood Mapping ---
const MOOD_TO_GENRE_MAP = {
  "action": { genres: ["action", "action_adventure"], query: "Action" },
  "thriller": { genres: ["thriller"], query: "Thriller" },
  "horror": { genres: ["horror"], query: "Horror" },
  "romance": { genres: ["romance"], query: "Romance" },
  "romantic": { genres: ["romance"], query: "Romance" },
  "sci-fi": { genres: ["scifi", "scifi_fantasy"], query: "Science Fiction" },
  "scifi": { genres: ["scifi", "scifi_fantasy"], query: "Science Fiction" },
  "science fiction": { genres: ["scifi", "scifi_fantasy"], query: "Science Fiction" },
  "mystery": { genres: ["mystery"], query: "Mystery" },
  "anime": { genres: ["animation"], query: "Animation", keyword: "Japan" },
  "animation": { genres: ["animation"], query: "Animation" },
  "adventure": { genres: ["adventure", "action_adventure"], query: "Adventure" },
  "comedy": { genres: ["comedy"], query: "Comedy" },
  "emotional": { genres: ["drama", "romance"], query: "Drama" },
  "sad": { genres: ["drama"], query: "Drama" },
  "motivational": { genres: ["drama"], query: "Inspirational" },
  "inspirational": { genres: ["drama"], query: "Inspirational" },
  "mind-blowing": { genres: ["scifi", "mystery", "thriller"], query: "Psychological" },
  "mind-bending": { genres: ["scifi", "mystery", "thriller"], query: "Psychological" },
  "mindbending": { genres: ["scifi", "mystery", "thriller"], query: "Psychological" },
  "dark": { genres: ["thriller", "horror", "crime"], query: "Dark" },
  "suspense": { genres: ["thriller", "mystery"], query: "Suspense" },
  "crime": { genres: ["crime"], query: "Crime" },
  "binge-worthy": { genres: ["drama", "comedy", "mystery"], query: "Popular" },
  "bingeworthy": { genres: ["drama", "comedy", "mystery"], query: "Popular" }
};

/**
 * Parses user search query to extract mapped genres, keywords, or types.
 */
function parseSearchQuery(queryText) {
  const cleanQuery = queryText.toLowerCase().trim();
  const result = {
    genres: [],
    genreIds: { movie: [], tv: [] },
    keywords: [],
    isTvSearch: false,
    isMovieSearch: false,
    textQuery: queryText
  };

  // Check if user specifically requested a type
  if (cleanQuery.includes("show") || cleanQuery.includes("series") || cleanQuery.includes("tv")) {
    result.isTvSearch = true;
  } else if (cleanQuery.includes("movie") || cleanQuery.includes("film")) {
    result.isMovieSearch = true;
  }

  // Find matches in mood map
  Object.keys(MOOD_TO_GENRE_MAP).forEach(moodKey => {
    if (cleanQuery.includes(moodKey)) {
      const mapping = MOOD_TO_GENRE_MAP[moodKey];
      mapping.genres.forEach(g => {
        if (!result.genres.includes(g)) {
          result.genres.push(g);
          // Add TMDb numerical IDs
          if (TMDb_GENRES.movie[g]) result.genreIds.movie.push(TMDb_GENRES.movie[g]);
          if (TMDb_GENRES.tv[g]) result.genreIds.tv.push(TMDb_GENRES.tv[g]);
        }
      });
      if (mapping.keyword) {
        result.keywords.push(mapping.keyword);
      }
    }
  });

  return result;
}

// --- Dynamic API Fetch Routines (with fallback detection) ---

/**
 * Generic Fetch wrapper handling endpoints and timeout/CORS error checking.
 */
async function fetchFromTMDb(endpoint, queryParams = {}) {
  const queryStr = new URLSearchParams({
    api_key: state.apiKey,
    language: 'en-US',
    ...queryParams
  }).toString();
  
  const url = `https://api.themoviedb.org/3/${endpoint}?${queryStr}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDb API returned status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`TMDb Fetch failed for endpoint ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetches search results based on user's query parameters (either via API or local fallback).
 */
async function getRecommendations(queryText) {
  state.currentQuery = queryText;
  const parsed = parseSearchQuery(queryText);
  
  // Update state tab choice based on text context if not explicitly clicked
  if (parsed.isTvSearch && !parsed.isMovieSearch) {
    state.activeTab = 'tv';
  } else if (parsed.isMovieSearch && !parsed.isTvSearch) {
    state.activeTab = 'movie';
  }

  // Tries TMDb first
  if (!state.isFallbackMode && state.apiKey) {
    try {
      showLoading(true);
      const results = await fetchTMDbRecommendations(parsed);
      if (results && results.length > 0) {
        state.searchResults = results;
        showLoading(false);
        return results;
      }
      console.warn("TMDb returned no results. Querying local fallback database.");
    } catch (e) {
      console.warn("TMDb API query failed. Switching to Local Fallback Database.", e);
      state.isFallbackMode = true;
      updateApiBadge();
      showToast("TMDb connection failed. Running in Fallback (Demo) Mode.", "warning");
    }
  }

  // Local Fallback Strategy
  showLoading(true);
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulated network latency for skeleton loader
  const results = getLocalRecommendations(parsed);
  state.searchResults = results;
  showLoading(false);
  return results;
}

/**
 * Discover TMDb movies and TV shows matching mapped genres.
 */
async function fetchTMDbRecommendations(parsed) {
  let movies = [];
  let tvShows = [];

  // Use OR (|) joining instead of AND (,) so compound queries (e.g. action romance) return hits
  const movieGenreIds = parsed.genreIds.movie.join('|');
  const tvGenreIds = parsed.genreIds.tv.join('|');

  // If no mapped genres, use standard query string search
  if (parsed.genres.length === 0) {
    const searchRes = await fetchFromTMDb('search/multi', { query: parsed.textQuery });
    const rawResults = searchRes.results || [];
    
    // Sort and separate
    const finalResults = rawResults
      .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
      .slice(0, 15)
      .map(item => transformTMDbItem(item));
      
    return finalResults;
  }

  // Fetch movies if matching movies (bubble up errors to trigger fallback)
  if (movieGenreIds && state.activeTab !== 'tv') {
    const res = await fetchFromTMDb('discover/movie', {
      with_genres: movieGenreIds,
      sort_by: 'popularity.desc',
      'vote_count.gte': 150,
      page: 1
    });
    movies = (res.results || []).map(item => ({ ...item, media_type: 'movie' }));
  }

  // Fetch TV shows if matching tv (bubble up errors to trigger fallback)
  if (tvGenreIds && state.activeTab !== 'movie') {
    const res = await fetchFromTMDb('discover/tv', {
      with_genres: tvGenreIds,
      sort_by: 'popularity.desc',
      'vote_count.gte': 50,
      page: 1
    });
    tvShows = (res.results || []).map(item => ({ ...item, media_type: 'tv' }));
  }

  // Interleave and take top 10
  const combined = [];
  const max = Math.max(movies.length, tvShows.length);
  for (let i = 0; i < max; i++) {
    if (movies[i] && state.activeTab !== 'tv') combined.push(transformTMDbItem(movies[i]));
    if (tvShows[i] && state.activeTab !== 'movie') combined.push(transformTMDbItem(tvShows[i]));
  }

  // Filter lists based on type tab
  let filtered = combined;
  if (state.activeTab === 'movie') {
    filtered = combined.filter(item => item.type === 'movie');
  } else if (state.activeTab === 'tv') {
    filtered = combined.filter(item => item.type === 'tv');
  }

  return filtered.slice(0, 10);
}

/**
 * Transforms standard TMDb item schema into clean UI-compatible item.
 */
function transformTMDbItem(item) {
  const isMovie = item.media_type === 'movie' || !!item.title;
  return {
    id: `${isMovie ? 'm' : 't'}_${item.id}`,
    tmdbId: item.id,
    title: isMovie ? item.title : item.name,
    type: isMovie ? 'movie' : 'tv',
    rating: parseFloat((item.vote_average || 0).toFixed(1)),
    releaseYear: parseInt(isMovie ? (item.release_date || '').split('-')[0] : (item.first_air_date || '').split('-')[0]) || 'N/A',
    description: item.overview || 'No description available.',
    poster: item.poster_path ? `${CONFIG.IMAGE_BASE_URL}${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${CONFIG.BACKDROP_BASE_URL}${item.backdrop_path}` : null,
    genres: [], // Handled or loaded dynamically
    genresIds: item.genre_ids || []
  };
}

/**
 * Local recommendations engine matching keywords, fallback database.
 */
function getLocalRecommendations(parsed) {
  // If query text is empty, return popular subset
  if (!parsed.textQuery || parsed.genres.length === 0) {
    let baseList = LOCAL_DATABASE;
    if (state.activeTab === 'movie') {
      baseList = LOCAL_DATABASE.filter(item => item.type === 'movie');
    } else if (state.activeTab === 'tv') {
      baseList = LOCAL_DATABASE.filter(item => item.type === 'tv');
    }
    return baseList.slice(0, 10);
  }

  // Score each item based on mapping matches
  const scored = LOCAL_DATABASE.map(item => {
    let score = 0;
    
    // Check type match
    if (state.activeTab === 'movie' && item.type !== 'movie') return null;
    if (state.activeTab === 'tv' && item.type !== 'tv') return null;

    // Direct mood string matches
    parsed.genres.forEach(g => {
      // check if matching in local genres
      const isGenreMatch = item.genres.some(ig => ig.toLowerCase().includes(g.toLowerCase()));
      if (isGenreMatch) score += 3;

      // check if matching item moods
      const isMoodMatch = item.moods.some(im => im.toLowerCase() === g.toLowerCase());
      if (isMoodMatch) score += 4;
    });

    // Substring in title or description matches
    const textStr = parsed.textQuery.toLowerCase();
    if (item.title.toLowerCase().includes(textStr)) score += 5;
    if (item.description.toLowerCase().includes(textStr)) score += 2;

    return { item, score };
  }).filter(Boolean);

  // Sort scored items by score desc, then by rating desc
  const sortedScored = scored.sort((a, b) => b.score - a.score || b.item.rating - a.item.rating);

  // Get matching items that have score > 0
  let finalResults = sortedScored.filter(res => res.score > 0).map(res => res.item);

  // If fewer than 10 matches are found, pad the results with non-matching high-rated items of correct type
  if (finalResults.length < 10) {
    const matchedIds = new Set(finalResults.map(item => item.id));
    const padItems = sortedScored
      .filter(res => res.score === 0 && !matchedIds.has(res.item.id))
      .map(res => res.item);
    finalResults = [...finalResults, ...padItems];
  }

  // Ultimate fallback if somehow we still have no matches (e.g. database is empty or filtered out)
  if (finalResults.length === 0) {
    finalResults = LOCAL_DATABASE.filter(item => {
      if (state.activeTab === 'movie') return item.type === 'movie';
      if (state.activeTab === 'tv') return item.type === 'tv';
      return true;
    }).slice(0, 10);
  }

  return finalResults.slice(0, 10);
}

// --- Fetching Trailer & Cast Details Dynamically ---

/**
 * Fetches YouTube key for a movie or TV show.
 */
async function getTrailerKey(item) {
  // If it's a local object and already has a trailer url, extract key
  if (item.id.startsWith('l_')) {
    const localItem = LOCAL_DATABASE.find(x => x.id === item.id);
    if (localItem && localItem.trailerUrl) {
      return localItem.trailerUrl.split('/').pop();
    }
  }

  // TMDb API Query
  const cleanId = item.id.replace('m_', '').replace('t_', '');
  const typeEndpoint = item.type === 'movie' ? 'movie' : 'tv';

  try {
    const res = await fetchFromTMDb(`${typeEndpoint}/${cleanId}/videos`);
    const videos = res.results || [];
    // Search for YouTube trailer
    const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos[0];
    return trailer ? trailer.key : null;
  } catch (e) {
    console.error("Failed to fetch trailer key from API", e);
    return null;
  }
}

/**
 * Fetches credits, runtime, tagline details for detailed popup.
 */
async function getExtendedDetails(item) {
  // If local, return local item
  if (item.id.startsWith('l_')) {
    return LOCAL_DATABASE.find(x => x.id === item.id);
  }

  // TMDb API Query
  const cleanId = item.id.replace('m_', '').replace('t_', '');
  const typeEndpoint = item.type === 'movie' ? 'movie' : 'tv';

  try {
    const details = await fetchFromTMDb(`${typeEndpoint}/${cleanId}`, {
      append_to_response: 'credits,videos'
    });
    
    // Format response schema
    const cast = (details.credits?.cast || []).slice(0, 5).map(c => c.name);
    const genres = (details.genres || []).map(g => g.name);
    
    let trailerKey = null;
    const videos = details.videos?.results || [];
    const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos[0];
    if (trailer) trailerKey = trailer.key;

    return {
      title: item.title,
      type: item.type,
      rating: item.rating,
      releaseYear: item.releaseYear,
      runtime: details.runtime ? `${details.runtime}m` : (details.episode_run_time ? `${details.episode_run_time[0]}m` : 'N/A'),
      genres: genres,
      description: details.overview || item.description,
      poster: item.poster,
      backdrop: item.backdrop || (details.backdrop_path ? `${CONFIG.BACKDROP_BASE_URL}${details.backdrop_path}` : null),
      trailerUrl: trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : null,
      cast: cast.length > 0 ? cast : ["N/A"],
      tagline: details.tagline || "",
      status: details.status || "Released"
    };
  } catch (e) {
    console.warn("Failed to fetch detailed info. Using card details.", e);
    // Dynamic local fallback if API details call fails
    return {
      title: item.title,
      type: item.type,
      rating: item.rating,
      releaseYear: item.releaseYear,
      runtime: item.type === 'movie' ? '120m' : '1 Season',
      genres: item.genres || ["Drama"],
      description: item.description,
      poster: item.poster,
      backdrop: item.backdrop,
      trailerUrl: null,
      cast: ["Cast information offline"],
      tagline: "",
      status: "Released"
    };
  }
}

// --- UI Rendering Engines ---

/**
 * Displays trending sliders and binds triggers on load.
 */
function renderTrendingSections() {
  const trendingMoviesRow = document.getElementById('trending-movies-row');
  const trendingTVRow = document.getElementById('trending-tv-row');
  const topRatedRow = document.getElementById('top-rated-row');

  // Filter movies for movie trending row
  const movies = LOCAL_DATABASE.filter(x => x.type === 'movie').sort((a,b) => b.rating - a.rating);
  const tvShows = LOCAL_DATABASE.filter(x => x.type === 'tv').sort((a,b) => b.rating - a.rating);
  const topRated = [...LOCAL_DATABASE].sort((a,b) => b.rating - a.rating);

  renderCardRow(movies, trendingMoviesRow);
  renderCardRow(tvShows, trendingTVRow);
  renderCardRow(topRated, topRatedRow);
}

/**
 * Helper to render horizontal rows.
 */
function renderCardRow(items, containerElement) {
  containerElement.innerHTML = '';
  items.forEach(item => {
    containerElement.appendChild(createMovieCardElement(item));
  });
}

/**
 * Creates movie card markup string & attaches events.
 */
function createMovieCardElement(item) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  
  // Format ratings
  const ratingText = item.rating ? item.rating.toFixed(1) : 'N/A';
  
  // Safe display poster path resolution
  let displayPoster = '';
  if (item.poster) {
    displayPoster = item.poster.startsWith('http') ? item.poster : `${CONFIG.IMAGE_BASE_URL}${item.poster}`;
  } else {
    // Force trigger image fallback if poster is missing
    displayPoster = 'missing-poster';
  }

  // Default taglines/meta
  const typeText = item.type === 'movie' ? 'Movie' : 'Series';
  
  // Safe genre retrieval for error handler
  const fallbackGenre = (item.genres && item.genres.length > 0) ? item.genres[0] : 'default';

  card.innerHTML = `
    <div class="card-img-wrapper">
      <img src="${displayPoster}" alt="${item.title}" class="card-img" loading="lazy" 
           onerror="handleImageError(this, '${fallbackGenre}')">
    </div>
    <div class="card-info">
      <div class="card-top-meta">
        <span class="card-badge">${typeText}</span>
        <span class="card-rating">
          <i class="fas fa-star"></i> ${ratingText}
        </span>
      </div>
      <h3 class="card-title">${item.title}</h3>
      <div class="card-meta-row">
        <span>${item.releaseYear}</span>
        <span>${item.runtime || ''}</span>
      </div>
      <p class="card-desc">${item.description}</p>
      <div class="card-actions">
        <button class="card-btn primary play-trailer-btn" title="Play Trailer">
          <i class="fas fa-play"></i> Trailer
        </button>
        <button class="card-btn secondary details-btn" title="More Info">
          <i class="fas fa-info-circle"></i> Info
        </button>
      </div>
    </div>
  `;

  // Attach dynamic event listeners inside container boundaries
  card.querySelector('.play-trailer-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openTrailerModal(item);
  });

  card.querySelector('.details-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openDetailsModal(item);
  });

  card.addEventListener('click', () => {
    openDetailsModal(item);
  });

  return card;
}

/**
 * Gracefully handles broken posters by substituting styled Unsplash placeholders.
 */
function handleImageError(imageElement, genre) {
  imageElement.onerror = null; // Prevent infinite loop
  const fallbackUrl = UNSPLASH_GENRE_IMAGES[genre] || UNSPLASH_GENRE_IMAGES['default'];
  imageElement.src = fallbackUrl;
  imageElement.style.objectFit = 'cover';
}

/**
 * Render recommendations list grid.
 */
function renderRecommendationsGrid(items) {
  const grid = document.getElementById('results-grid');
  grid.innerHTML = '';

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div class="error-state">
        <i class="fas fa-search-minus"></i>
        <h3 class="error-title">No Recommendations Found</h3>
        <p class="error-desc">We couldn't map your mood or keywords. Try entering terms like "spooky", "mind-bending", "romantic", or "intense action".</p>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    grid.appendChild(createMovieCardElement(item));
  });
}

/**
 * Dynamic Loading skeleton indicators for premium UI effect.
 */
function showLoading(isLoading) {
  const grid = document.getElementById('results-grid');
  const spinner = document.getElementById('search-loader');
  
  if (isLoading) {
    spinner.style.display = 'flex';
    grid.innerHTML = '';
    // Show 5 skeleton loader placeholders
    for (let i = 0; i < 5; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-card';
      grid.appendChild(skeleton);
    }
  } else {
    spinner.style.display = 'none';
  }
}

// --- Modal Controllers ---

/**
 * Opens YouTube trailer overlay.
 */
async function openTrailerModal(item) {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  
  showToast("Fetching trailer link...", "info");
  
  const key = await getTrailerKey(item);
  if (!key) {
    showToast("Sorry, no trailer link was found for this title.", "warning");
    // Try opening a YouTube search link in a new tab as ultimate fallback
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' trailer')}`, '_blank');
    return;
  }

  iframe.src = `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden'; // Lock background scroll
}

/**
 * Closes YouTube trailer overlay.
 */
function closeTrailerModal() {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  
  iframe.src = ''; // Clear source to stop audio playing
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Opens More Info Modal overlay.
 */
async function openDetailsModal(item) {
  const modal = document.getElementById('details-modal');
  showToast("Loading media details...", "info");

  const info = await getExtendedDetails(item);
  
  const backdropImg = info.backdrop ? 
    (info.backdrop.startsWith('http') ? info.backdrop : `${CONFIG.BACKDROP_BASE_URL}${info.backdrop}`) :
    (info.poster.startsWith('http') ? info.poster : `${CONFIG.IMAGE_BASE_URL}${info.poster}`);

  // Populate Details Modal Elements
  document.getElementById('details-modal-header').style.backgroundImage = `url('${backdropImg}')`;
  document.getElementById('details-modal-title').textContent = info.title;
  document.getElementById('details-rating').innerHTML = `<i class="fas fa-star"></i> ${info.rating.toFixed(1)}`;
  document.getElementById('details-year').textContent = info.releaseYear;
  document.getElementById('details-runtime').textContent = info.runtime || 'N/A';
  document.getElementById('details-status').textContent = info.status || 'Released';
  document.getElementById('details-tagline').textContent = info.tagline ? `"${info.tagline}"` : '';
  document.getElementById('details-overview').textContent = info.description;
  
  // Render cast list
  const castVal = document.getElementById('details-cast-value');
  castVal.textContent = info.cast.join(', ');

  // Render Genre Tags
  const genresWrapper = document.getElementById('details-genres-value');
  genresWrapper.innerHTML = '';
  info.genres.forEach(g => {
    const span = document.createElement('span');
    span.className = 'genre-badge';
    span.textContent = g;
    genresWrapper.appendChild(span);
  });

  // Setup play trailer button on details modal
  const playBtn = document.getElementById('details-play-btn');
  playBtn.onclick = () => {
    closeDetailsModal();
    openTrailerModal(item);
  };

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Closes More Info modal.
 */
function closeDetailsModal() {
  const modal = document.getElementById('details-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// --- Configuration / Settings Overlay ---

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const input = document.getElementById('api-key-input');
  
  // Fill input with current API key if it's not the default key
  input.value = state.apiKey === CONFIG.DEFAULT_API_KEY ? '' : state.apiKey;
  modal.classList.add('open');
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.remove('open');
}

function saveSettings() {
  const inputVal = document.getElementById('api-key-input').value.trim();
  
  if (inputVal) {
    state.apiKey = inputVal;
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, inputVal);
    state.isFallbackMode = false;
    showToast("TMDb API Key saved successfully. Real-time data mode active.", "success");
  } else {
    // Revert to default key
    state.apiKey = CONFIG.DEFAULT_API_KEY;
    localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY);
    state.isFallbackMode = false;
    showToast("API Key cleared. Using default configurations.", "info");
  }

  updateApiBadge();
  closeSettingsModal();

  // Re-run current search if key changes
  if (state.currentQuery) {
    performSearch(state.currentQuery);
  }
}

function updateApiBadge() {
  const badge = document.getElementById('api-badge');
  const label = badge.querySelector('.api-status-label');
  
  if (state.isFallbackMode) {
    badge.className = 'api-status-badge fallback';
    label.textContent = 'Fallback Mode (Demo)';
  } else if (state.apiKey && state.apiKey !== CONFIG.DEFAULT_API_KEY) {
    badge.className = 'api-status-badge connected';
    label.textContent = 'Connected (TMDb)';
  } else {
    badge.className = 'api-status-badge';
    label.textContent = 'Active (Default API)';
  }
}

// --- Toast Feedback Utility ---

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';

  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  
  // Animate Entrance
  setTimeout(() => toast.classList.add('show'), 50);

  // Auto Destruct
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// --- Search Flow Execution ---

async function performSearch(queryStr) {
  if (!queryStr) return;

  const resultsSec = document.getElementById('results-section');
  const resultsHeader = document.getElementById('results-search-title');
  const scrollAnchor = document.getElementById('results-scroll-anchor');

  // Display results section and auto scroll smoothly
  resultsSec.style.display = 'block';
  scrollAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Update query headers
  resultsHeader.innerHTML = `AI Suggestions for "<span>${queryStr}</span>"`;

  const results = await getRecommendations(queryStr);
  renderRecommendationsGrid(results);
}

// --- Carousel Scroll Actions ---

function handleCarouselScroll(direction, buttonElement) {
  const wrapper = buttonElement.closest('.category-row-wrapper');
  const row = wrapper.querySelector('.category-row');
  const scrollAmount = row.clientWidth * 0.75;
  
  if (direction === 'left') {
    row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

// --- Initialization / Event Mapping ---

document.addEventListener('DOMContentLoaded', () => {
  // Bind Header Scroll Effect
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Render Trending lists immediately
  renderTrendingSections();
  updateApiBadge();

  // Search Submit Handler
  const searchForm = document.getElementById('hero-search-form');
  const searchInput = document.getElementById('hero-search-input');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
    } else {
      showToast("Please enter a genre, mood, or keyword first.", "warning");
    }
  });

  // Trending Tag Click Handler
  const tags = document.querySelectorAll('.tag-btn');
  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      // Toggle Active States
      tags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');

      const query = tag.getAttribute('data-genre');
      searchInput.value = query;
      performSearch(query);
    });
  });

  // Tab Filtering (All, Movies, TV Shows)
  const tabBtns = document.querySelectorAll('.toggle-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      state.activeTab = btn.getAttribute('data-type');
      
      // Re-run current search if present
      const currentSearchQuery = searchInput.value.trim() || state.currentQuery;
      if (currentSearchQuery) {
        performSearch(currentSearchQuery);
      }
    });
  });

  // Carousel Slider Arrows Click
  const arrows = document.querySelectorAll('.slider-arrow');
  arrows.forEach(arrow => {
    arrow.addEventListener('click', (e) => {
      const isLeft = arrow.classList.contains('left');
      handleCarouselScroll(isLeft ? 'left' : 'right', arrow);
    });
  });

  // Modal Backdrops Click to Close
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeTrailerModal();
        closeDetailsModal();
        closeSettingsModal();
      }
    });
  });

  // Keyboard Accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTrailerModal();
      closeDetailsModal();
      closeSettingsModal();
    }
  });
});
