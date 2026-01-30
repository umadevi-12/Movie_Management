import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { movieAPI } from '../services/api';
import './BrowsePage.css';

const BrowsePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('name');
  const [filterGenre, setFilterGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrailer, setShowTrailer] = useState(null);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Enhanced SAMPLE MOVIE DATA with consistent image sizes
  const sampleMovies = [
    {
      _id: '1',
      name: 'The Shawshank Redemption',
      genre: 'Drama',
      releaseYear: 1994,
      rating: 9.3,
      runtime: 142,
      description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      image: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/6hB3S9bIaco'
    },
    {
      _id: '2',
      name: 'The Godfather',
      genre: 'Crime',
      releaseYear: 1972,
      rating: 9.2,
      runtime: 175,
      description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      image: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/sY1S34973zA'
    },
    {
      _id: '3',
      name: 'The Dark Knight',
      genre: 'Action',
      releaseYear: 2008,
      rating: 9.0,
      runtime: 152,
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      image: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY'
    },
    {
      _id: '4',
      name: 'Inception',
      genre: 'Sci-Fi',
      releaseYear: 2010,
      rating: 8.8,
      runtime: 148,
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      image: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0'
    },
    {
      _id: '5',
      name: 'Pulp Fiction',
      genre: 'Crime',
      releaseYear: 1994,
      rating: 8.9,
      runtime: 154,
      description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
      image: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/s7EdQ4FqbhY'
    },
    {
      _id: '6',
      name: 'Forrest Gump',
      genre: 'Drama',
      releaseYear: 1994,
      rating: 8.8,
      runtime: 142,
      description: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
      image: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/bLvqoHBptjg'
    },
    {
      _id: '7',
      name: 'The Matrix',
      genre: 'Sci-Fi',
      releaseYear: 1999,
      rating: 8.7,
      runtime: 136,
      description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      image: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8'
    },
    {
      _id: '8',
      name: 'Goodfellas',
      genre: 'Crime',
      releaseYear: 1990,
      rating: 8.7,
      runtime: 146,
      description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',
      image: 'https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg',
      trailerUrl: 'https://www.youtube.com/embed/qo5jJpHtI1Y'
    },
    
  {
    _id: '9',
    name: 'The Lord of the Rings: The Fellowship of the Ring',
    genre: 'Fantasy',
    releaseYear: 2001,
    rating: 8.8,
    runtime: 178,
    description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
    image: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/V75dMMIW2B4'
  },
  {
    _id: '10',
    name: 'Fight Club',
    genre: 'Drama',
    releaseYear: 1999,
    rating: 8.8,
    runtime: 139,
    description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
    image: 'https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/qtRKdVHc-cE'
  },
  {
    _id: '11',
    name: 'Interstellar',
    genre: 'Sci-Fi',
    releaseYear: 2014,
    rating: 8.6,
    runtime: 169,
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    image: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E'
  },
  {
    _id: '12',
    name: 'Parasite',
    genre: 'Thriller',
    releaseYear: 2019,
    rating: 8.6,
    runtime: 132,
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    image: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/5xH0HfJHsaY'
  },
  {
    _id: '13',
    name: 'Gladiator',
    genre: 'Action',
    releaseYear: 2000,
    rating: 8.5,
    runtime: 155,
    description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
    image: 'https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/P5ieIbInFpg'
  },
  {
    _id: '14',
    name: 'The Silence of the Lambs',
    genre: 'Thriller',
    releaseYear: 1991,
    rating: 8.6,
    runtime: 118,
    description: 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.',
    image: 'https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/W6Mm8Sbe__o'
  },
  {
    _id: '15',
    name: 'Saving Private Ryan',
    genre: 'War',
    releaseYear: 1998,
    rating: 8.6,
    runtime: 169,
    description: 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
    image: 'https://m.media-amazon.com/images/M/MV5BZjhkMDM4MWItZTVjOC00ZDRhLThmYTAtM2I5NzBmNmNlMzI1XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/9CiW_DgxCnQ'
  },
  {
    _id: '16',
    name: 'The Green Mile',
    genre: 'Drama',
    releaseYear: 1999,
    rating: 8.6,
    runtime: 189,
    description: 'The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift.',
    image: 'https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/Ki4haFrqSrw'
  },
  {
    _id: '17',
    name: 'Se7en',
    genre: 'Thriller',
    releaseYear: 1995,
    rating: 8.6,
    runtime: 127,
    description: 'Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.',
    image: 'https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjczMi00OTk4LTg3NWUtNmVhMTAzNTNjYjcyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/znmZoVkCjpI'
  },
  {
    _id: '18',
    name: 'The Usual Suspects',
    genre: 'Crime',
    releaseYear: 1995,
    rating: 8.5,
    runtime: 106,
    description: 'A sole survivor tells of the twisty events leading up to a horrific gun battle on a boat, which begin when five criminals meet at a seemingly random police lineup.',
    image: 'https://m.media-amazon.com/images/M/MV5BYTViNjMyNmUtNDFkNC00ZDRlLThmMDUtZDU2YWE4NGI2ZjVmXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/oiXdPolca5w'
  },
  {
    _id: '19',
    name: 'Léon: The Professional',
    genre: 'Action',
    releaseYear: 1994,
    rating: 8.5,
    runtime: 110,
    description: '12-year-old Mathilda is reluctantly taken in by Léon, a professional assassin, after her family is murdered. An unusual relationship forms as she becomes his protégée and learns the assassin\'s trade.',
    image: 'https://m.media-amazon.com/images/M/MV5BODllNWE0MmEtYjUwZi00ZjY3LThmNmQtZjZlMjI2YTZjYmQ0XkEyXkFqcGdeQXVyNTc1NTQxODI@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/aNQqoExfQsg'
  },
  {
    _id: '20',
    name: 'The Prestige',
    genre: 'Drama',
    releaseYear: 2006,
    rating: 8.5,
    runtime: 130,
    description: 'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.',
    image: 'https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/ELq7V8vkekI'
  },
  {
    _id: '21',
    name: 'The Departed',
    genre: 'Crime',
    releaseYear: 2006,
    rating: 8.5,
    runtime: 151,
    description: 'An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.',
    image: 'https://m.media-amazon.com/images/M/MV5BMTI1MTY2OTIxNV5BMl5BanBnXkFtZTYwNjQ4NjY3._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/iojhqm0JTW4'
  },
  {
    _id: '22',
    name: 'Whiplash',
    genre: 'Drama',
    releaseYear: 2014,
    rating: 8.5,
    runtime: 106,
    description: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
    image: 'https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/7d_jQycdQGo'
  },
  {
    _id: '23',
    name: 'Avengers: Infinity War',
    genre: 'Action',
    releaseYear: 2018,
    rating: 8.4,
    runtime: 149,
    description: 'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.',
    image: 'https://m.media-amazon.com/images/M/MV5BMjMxNjY2MDU1OV5BMl5BanBnXkFtZTgwNzY1MTUwNTM@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/6ZfuNTqbHE8'
  },
  {
    _id: '24',
    name: 'Joker',
    genre: 'Drama',
    releaseYear: 2019,
    rating: 8.4,
    runtime: 122,
    description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.',
    image: 'https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/zAGVQLHvwOY'
  },
  {
    _id: '25',
    name: 'Your Name',
    genre: 'Animation',
    releaseYear: 2016,
    rating: 8.4,
    runtime: 106,
    description: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
    image: 'https://m.media-amazon.com/images/M/MV5BODRmZDVmNzUtZDA4ZC00NjhkLWI2M2UtN2M0ZDIzNDcxYThjL2ltYWdlXkEyXkFqcGdeQXVyNTk0MzMzODA@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/xU47nhruN-Q'
  },
  {
    _id: '26',
    name: 'Spirited Away',
    genre: 'Animation',
    releaseYear: 2001,
    rating: 8.6,
    runtime: 125,
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    image: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/ByXuk9QqQkk'
  },
  {
    _id: '27',
    name: 'The Pianist',
    genre: 'Drama',
    releaseYear: 2002,
    rating: 8.5,
    runtime: 150,
    description: 'A Polish Jewish musician struggles to survive the destruction of the Warsaw ghetto of World War II.',
    image: 'https://m.media-amazon.com/images/M/MV5BOWRiZDIxZjktMTA1NC00MDQ2LWEzMjUtMTliZmY3NjQ3ODJiXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/BFwGqLa_oAo'
  },
  {
    _id: '28',
    name: 'Django Unchained',
    genre: 'Drama',
    releaseYear: 2012,
    rating: 8.4,
    runtime: 165,
    description: 'With the help of a German bounty hunter, a freed slave sets out to rescue his wife from a brutal Mississippi plantation owner.',
    image: 'https://m.media-amazon.com/images/M/MV5BMjIyNTQ5NjQ1OV5BMl5BanBnXkFtZTcwODg1MDU4OA@@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/0fUCuvNlOCg'
  },
  {
    _id: '29',
    name: 'The Lion King',
    genre: 'Animation',
    releaseYear: 1994,
    rating: 8.5,
    runtime: 88,
    description: 'A young lion prince is cast out of his pride by his cruel uncle, who claims he killed his father. While the uncle rules with an iron paw, the prince grows up beyond the savannah, living by a philosophy: No worries for the rest of your days.',
    image: 'https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/4sj1MT05lAA'
  },
  {
    _id: '30',
    name: 'Terminator 2: Judgment Day',
    genre: 'Action',
    releaseYear: 1991,
    rating: 8.6,
    runtime: 137,
    description: 'A cyborg, identical to the one who failed to kill Sarah Connor, must now protect her ten-year-old son John from a more advanced and powerful cyborg.',
    image: 'https://m.media-amazon.com/images/M/MV5BMGU2NzRmZjUtOGUxYS00ZjdjLWEwZWItY2NlM2JhNjkxNTFmXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX1000_.jpg',
    trailerUrl: 'https://www.youtube.com/embed/CRRlbK5w8AE'
  }

    
  ];

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('Fetching movies...');
      
      try {
        const data = await movieAPI.getAllMovies();
        console.log('API Response:', data);
        
        if (data && Array.isArray(data) && data.length > 0) {
          setMovies(data);
        } else {
          console.log('API returned empty, using sample data');
          setMovies(sampleMovies);
        }
      } catch (apiError) {
        console.log('API failed, using sample data:', apiError);
        setMovies(sampleMovies);
      }
      
    } catch (err) {
      console.error('Error in fetchMovies:', err);
      setError('Failed to load movies. Showing sample data instead.');
      setMovies(sampleMovies);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieAPI.deleteMovie(id);
        setMovies(movies.filter(movie => movie._id !== id));
        setShowDeleteConfirm(null);
      } catch (err) {
        console.error('Delete error:', err);
        setMovies(movies.filter(movie => movie._id !== id));
        setShowDeleteConfirm(null);
      }
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const updatedMovie = await movieAPI.updateMovie(id, updatedData);
      setMovies(movies.map(movie => 
        movie._id === id ? updatedMovie : movie
      ));
      setEditingMovie(null);
      return updatedMovie;
    } catch (err) {
      console.error('Update error:', err);
      const updatedMovie = { ...movies.find(m => m._id === id), ...updatedData };
      setMovies(movies.map(movie => 
        movie._id === id ? updatedMovie : movie
      ));
      setEditingMovie(null);
      return updatedMovie;
    }
  };

  const uniqueGenres = ['all', ...new Set(movies.map(movie => movie.genre).filter(Boolean))];

  const filteredMovies = movies
    .filter(movie => {
      const matchesSearch = searchQuery === '' || 
        movie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesGenre = filterGenre === 'all' || movie.genre === filterGenre;
      
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'year':
          return b.releaseYear - a.releaseYear;
        case 'rating':
          return b.rating - a.rating;
        case 'runtime':
          return b.runtime - a.runtime;
        default:
          return 0;
      }
    });

  const openTrailer = (trailerUrl) => {
    if (trailerUrl) {
      setShowTrailer(trailerUrl);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(null);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
  };

  const handleSaveEdit = async (id, updatedData) => {
    await handleUpdate(id, updatedData);
  };

  const handleCancelEdit = () => {
    setEditingMovie(null);
  };

  const confirmDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your movie collection...</p>
      </div>
    );
  }

  return (
    <div className="browse-page">
      {/* Header Section */}
      <div className="browse-header">
        <div className="header-content">
          <h1>🎬 MovieMaster Collection</h1>
          <p className="subtitle">
            You have {movies.length} movies in your collection. 
            {filteredMovies.length !== movies.length && ` Showing ${filteredMovies.length} after filtering.`}
          </p>
        </div>
        <div className="header-actions">
          <Link to="/add-movie" className="add-btn">
            🎥 Add New Movie
          </Link>
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          ⚠️ {error}
          <button onClick={fetchMovies} className="retry-btn">
            Retry Connection
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies by title, description, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="clear-search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="browse-controls">
        <div className="view-controls">
          <span className="control-label">View as:</span>
          <button 
            onClick={() => setViewMode('grid')}
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            ◼ Grid View
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            ☰ List View
          </button>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="genre-filter">Genre:</label>
            <select
              id="genre-filter"
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="filter-select"
            >
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Name (A-Z)</option>
              <option value="year">Year (Newest)</option>
              <option value="rating">Rating (Highest)</option>
              <option value="runtime">Runtime (Longest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies Display */}
      {filteredMovies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎥</div>
          <h3>No movies found</h3>
          <p>
            {searchQuery || filterGenre !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Your collection is empty. Add your first movie to get started!'
            }
          </p>
          <div className="empty-actions">
            <Link to="/add-movie" className="add-movie-btn">
              ➕ Add Your First Movie
            </Link>
            {(searchQuery || filterGenre !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterGenre('all');
                }}
                className="reset-filter-btn"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="movies-grid">
              {filteredMovies.map(movie => (
                <div key={movie._id} className="movie-card-container">
                  <MovieCard
                    movie={movie}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onTrailerClick={openTrailer}
                    onEdit={handleEditMovie}
                    isEditing={editingMovie && editingMovie._id === movie._id}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    showDeleteConfirm={showDeleteConfirm === movie._id}
                    onConfirmDelete={confirmDelete}
                    onCancelDelete={cancelDelete}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="movies-list">
              <div className="list-header">
                <div className="list-column movie-info-col">Movie</div>
                <div className="list-column">Genre</div>
                <div className="list-column">Year</div>
                <div className="list-column">Rating</div>
                <div className="list-column">Runtime</div>
                <div className="list-column">Actions</div>
              </div>
              {filteredMovies.map(movie => (
                <div key={movie._id} className="list-item">
                  <div className="list-cell movie-info">
                    <div className="movie-thumbnail">
                      <img 
                        src={movie.image} 
                        alt={movie.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x150/333/666?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="movie-details">
                      <h4>{movie.name}</h4>
                      {movie.description && (
                        <p className="movie-description">{movie.description.substring(0, 100)}...</p>
                      )}
                      {movie.trailerUrl && (
                        <button 
                          onClick={() => openTrailer(movie.trailerUrl)}
                          className="trailer-btn-list"
                        >
                          ▶️ Watch Trailer
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="list-cell movie-genre">
                    <span className="genre-badge">{movie.genre}</span>
                  </div>
                  <div className="list-cell movie-year">
                    {movie.releaseYear}
                  </div>
                  <div className="list-cell movie-rating">
                    <span className={`rating-badge ${
                      movie.rating >= 8 ? 'excellent' : 
                      movie.rating >= 6.5 ? 'good' : 
                      movie.rating >= 5 ? 'average' : 'poor'
                    }`}>
                      ⭐ {movie.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="list-cell movie-runtime">
                    <span className="runtime-badge">
                      ⏱️ {movie.runtime || 'N/A'} min
                    </span>
                  </div>
                  <div className="list-cell movie-actions">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditMovie(movie)}
                        className="action-btn edit-btn-list"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => confirmDelete(movie._id)}
                        className="action-btn delete-btn-list"
                      >
                        🗑
                      </button>
                    </div>
                    {showDeleteConfirm === movie._id && (
                      <div className="delete-confirmation">
                        <p>Delete this movie?</p>
                        <div className="delete-confirm-buttons">
                          <button 
                            onClick={() => handleDelete(movie._id)}
                            className="confirm-delete-btn"
                          >
                            Yes
                          </button>
                          <button 
                            onClick={cancelDelete}
                            className="cancel-delete-btn"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Collection Stats */}
          <div className="collection-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h4>Collection Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Movies:</span>
                    <span className="stat-value">{movies.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average Rating:</span>
                    <span className="stat-value">
                      {movies.length > 0 
                        ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1)
                        : '0.0'
                      }
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Runtime:</span>
                    <span className="stat-value">
                      {movies.length > 0 && movies.every(m => m.runtime)
                        ? Math.round(movies.reduce((sum, m) => sum + (m.runtime || 0), 0) / 60) + ' hours'
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Unique Genres:</span>
                    <span className="stat-value">{uniqueGenres.length - 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="trailer-modal" onClick={closeTrailer}>
          <div className="trailer-modal-content" onClick={e => e.stopPropagation()}>
            <div className="trailer-modal-header">
              <h3>Movie Trailer</h3>
              <button onClick={closeTrailer} className="close-trailer-btn">
                ✕
              </button>
            </div>
            <div className="trailer-video-container">
              <iframe
                src={showTrailer.replace('watch?v=', 'embed/')}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMovie && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Movie</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedData = {
                name: formData.get('name'),
                genre: formData.get('genre'),
                releaseYear: parseInt(formData.get('releaseYear')),
                rating: parseFloat(formData.get('rating')),
                runtime: parseInt(formData.get('runtime')),
                description: formData.get('description'),
                image: formData.get('image'),
                trailerUrl: formData.get('trailerUrl')
              };
              handleSaveEdit(editingMovie._id, updatedData);
            }}>
              <div className="form-group">
                <label>Movie Title</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingMovie.name}
                  required
                />
              </div>
              <div className="form-group">
                <label>Genre</label>
                <select name="genre" defaultValue={editingMovie.genre} required>
                  <option value="Action">Action</option>
                  <option value="Drama">Drama</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Crime">Crime</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Horror">Horror</option>
                  <option value="Animation">Animation</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Release Year</label>
                  <input
                    type="number"
                    name="releaseYear"
                    defaultValue={editingMovie.releaseYear}
                    min="1900"
                    max="2030"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rating (0-10)</label>
                  <input
                    type="number"
                    name="rating"
                    defaultValue={editingMovie.rating}
                    min="0"
                    max="10"
                    step="0.1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Runtime (minutes)</label>
                  <input
                    type="number"
                    name="runtime"
                    defaultValue={editingMovie.runtime}
                    min="1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Poster Image URL</label>
                <input
                  type="url"
                  name="image"
                  defaultValue={editingMovie.image}
                  placeholder="https://example.com/poster.jpg"
                />
              </div>
              <div className="form-group">
                <label>Trailer URL (YouTube)</label>
                <input
                  type="url"
                  name="trailerUrl"
                  defaultValue={editingMovie.trailerUrl}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  defaultValue={editingMovie.description}
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-edit-btn">
                  💾 Save Changes
                </button>
                <button type="button" onClick={handleCancelEdit} className="cancel-edit-btn">
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Status */}
      <div className="api-status">
        <p>
          <strong>Status:</strong> {movies === sampleMovies 
            ? 'Using sample data (backend not connected)' 
            : 'Connected to backend API'}
        </p>
        <div className="status-actions">
          <button onClick={fetchMovies} className="refresh-btn">
            🔄 Refresh Collection
          </button>
          {movies.some(m => m.trailerUrl) && (
            <span className="trailer-count">
              🎬 {movies.filter(m => m.trailerUrl).length} movies with trailers
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;