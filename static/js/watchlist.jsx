const ClubButtons = () => {
    const [club_id, updateClub] = React.useState(0);
    const [buttons, updateButtons] = React.useState([]);

    React.useEffect(() => {
        fetch('/club-buttons')
            .then(response => {
                return response.json();
            })
            .then(clubs => {
                const btns = [];
                // Generate buttons key = club_id, value = club name
                for (const [key, value] of Object.entries(clubs)) {
                    btns.push(
                        // Use club_id as button key
                        <div className="column" id={`btn_div${key}`}>
                            <button type="button" className="removeBtn btn btn-outline-warning mr-2" onClick={() => updateClub(key)}>{value}</button>
                        </div>
                    );
                }
                updateButtons(btns);
            });
    }, []);
    return (
        <React.Fragment>
            {/* <section className="word-container watchlist">{buttons}</section> */}
            <div id="button-div" class="btn-group mb-2" role="group">{buttons}</div>
            <SearchList club_id={club_id} />
        </React.Fragment>
    )
}

const Filter = (evt) => {
    // get all movie divs
    const divs = document.getElementsByClassName('watchDiv');
    // get selected genre and runtime from dropdown
    const selectedGenre = document.getElementById('genreSelectEl').value;
    const selectedRuntime = document.getElementById('runtimeSelect').value;

    // if filters cleared, display all
    if (selectedGenre === "All" && selectedRuntime === "All") {
        for (const d of divs) {
            d.style.display = "block";
        }
    } else {
        for (const d of divs) {
            // get all genres for a movie
            const genItems = d.getElementsByClassName('genreItem');
            const movieGenres = [];
            for (const g of genItems) {
                movieGenres.push(g.innerHTML);
            }
            // get runtime value from innerHTML
            const rt_paragraph = d.querySelector('#runtime').innerHTML;
            const film_rt = parseInt(rt_paragraph.slice(9));

            // if both are filtered
            if (selectedGenre !== "All" && selectedRuntime !== "All") {
                if (selectedRuntime < film_rt || !movieGenres.includes(selectedGenre)) {
                    d.style.display = "none";
                } else {
                    d.style.display = "block";
                }
            }

            // if only genres is filtered
            else if (selectedRuntime === "All") {
                if (!movieGenres.includes(selectedGenre)) {
                    d.style.display = "none";
                } else {
                    d.style.display = "block";
                }
            }

            // if only runtime is filtered
            else if (selectedGenre === "All") {
                // if runtime exceed max runtime, hide
                if (selectedRuntime < film_rt) {
                    d.style.display = "none";
                }
                else {
                    d.style.display = "block";
                }
            }

        }

    }
}


const SearchList = (props) => {
    const [genres, updateGenres] = React.useState([]);
    const club_id = props.club_id
    React.useEffect(() => {
        fetch(`/club-filters?id=${club_id}`)
            .then(response => response.json())
            .then(results => {
                updateGenres(results);
            });
    }, [props.club_id]);
    return (
        <React.Fragment>
            <section className="word-container">
                <div className="row">
                    <div className="column col-2">
                        <h6>Genres</h6>
                        <form>
                            <select className="form-control" onChange={Filter} id="genreSelectEl">
                                <option>All</option>
                                {genres.map(genre => (<option value={genre} id={genre}>{genre}</option>))}
                            </select>
                        </form>
                    </div>
                    <div className="column col-2">
                        <h6>Max Runtime</h6>
                        <select className="form-control" onChange={Filter} id="runtimeSelect">
                            <option value="All">All</option>
                            <option value="90">60</option>
                            <option value="90">90</option>
                            <option value="120">120</option>
                            <option value="150">150</option>
                            <option value="180">180</option>
                            <option value="210">210</option>
                        </select>
                    </div>
                </div>
            </section>
            <Watchlist club_id={club_id} />
        </React.Fragment>

    )
}

const Watchlist = (props) => {
    const [movies, updateMovies] = React.useState([]);
    React.useEffect(() => {
        fetch(`/watchlist?club_id=${props.club_id}`)
            .then(response => response.json())
            .then(films => {
                // Initiliaze empty helper array for movie details
                const helper = [];
                // Loop over film objects
                for (const [key, value] of Object.entries(films)) {
                    let scheduled_date;
                    if (value['view_date']){
                        scheduled_date = value['view_date'];
                    } else {
                        scheduled_date = "Not Scheduled";
                    }
                    let movie_poster_src;
                    if (value['poster_path']){
                        movie_poster_src = `https://image.tmdb.org/t/p/w500/${value['poster_path']}`;
                    } else {
                        movie_poster_src = "/static/images/no_poster.jpeg";
                    }
                    helper.push(
                        <div id={`div${key}`} className="watchDiv">
                            <div className="mylists">
                                <div className="mylists-pic">
                                    <img id={`img${key}`} name={value['title']} src={movie_poster_src} onClick={Modal}></img>
                                </div>
                                <div className="mylists-text">
                                    <h5>{value['title']}</h5>
                                    <h6>View Date: {scheduled_date}</h6>
                                    <ul id="genreList">Genres:<br></br>   
                                        {value['genres'].map(genre => (<span className="badge badge-pill badge-warning genreItem">{genre['name']}</span>))}
                                    </ul>
                                    <p id="runtime">Runtime: {value['runtime']}</p>
                                    <p>Voter Average: {value['vote_average']}</p>
                                    <p>{value['overview']}</p>
                                </div>
                            </div>
                        </div>
                    );
                }
                // Replace empty movies array in state with values from helper array
                updateMovies(movies => helper);

            })
    }, [props.club_id]);
    return (
        <React.Fragment>
            <section className="word-container watchlist">{movies}</section>
        </React.Fragment>
    )
}

function Modal(evt) {
    evt.preventDefault();

    const film_id = evt.target.id.slice(3);
    const film_name = evt.target.name;

    const modal = document.getElementById("list-modal");

    // add schedule button if not scheduled
    fetch(`/schedule-check?id=${film_id}`)
        .then(response => response.text())
        .then(scheduled => {
            if (scheduled == 'True') {
                modal.innerHTML = `<div class=modal-content><span id="close" align="right" class=close>&times;</span>
                                <h1>${film_name}</h1>
                                <button id="rmv${film_id}" name="rmv${film_name}" class="removeBtn btn btn-dark">Remove</button>
                                <br>
                                <button id="wt${film_id}" class="watchBtn btn btn-dark">Watched</button> 
                                <br>
                                </div>`;

                // make the modal visible
                modal.style.display = "block";

                // get close button for model
                const closeBtn = document.getElementById("close");
                // when close button is clicked, hide the modal
                closeBtn.addEventListener('click', () => modal.style.display = "none");

                // Remove from List
                const rmv = modal.querySelector('.removeBtn');

                rmv.addEventListener('click', (evt) => {
                    const film_id = evt.target.id.slice(3);
                    const film_name = evt.target.name.slice(3);
                    fetch(`/remove-film?id=${film_id}&name=${film_name}`)
                        .then(response => response.text())
                        .then(evt.target.disabled = true)
                });

                // Mark as watched
                const wat = modal.querySelector('.watchBtn');

                wat.addEventListener('click', (evt) => {
                    const film_id = evt.target.id.slice(2);

                    fetch(`/watched-film?id=${film_id}`)
                        .then(response => response.text())
                        .then(evt.target.disabled = true)
                })

            }
            else {
                modal.innerHTML = `<div class=modal-content><span id="close" align="right" class=close>&times;</span>
                                <h1 class="film-title">${film_name}</h1>
                                <button id="rmv${film_id}" name="rmv${film_name}" class="removeBtn btn btn-dark">Remove</button>
                                <br>
                                <button id="wt${film_id}" class="watchBtn btn btn-dark">Watched</button> 
                                <br>
                                <input type="date" id="schedDate">
                                <button id="sch${film_id}" name="sch${film_name}" class="schBtn btn btn-dark">Schedule</button> 
                                </div>`;

                // make the modal visible
                modal.style.display = "block";

                // get close button for model
                const closeBtn = document.getElementById("close");
                // when close button is clicked, hide the modal
                closeBtn.addEventListener('click', () => modal.style.display = "none");

                // Remove from List
                const rmv = modal.querySelector('.removeBtn');

                rmv.addEventListener('click', (evt) => {
                    const film_id = evt.target.id.slice(3);
                    const film_name = evt.target.name.slice(3);
                    fetch(`/remove-film?id=${film_id}&name=${film_name}`)
                        .then(response => response.text())
                        .then(evt.target.disabled = true)
                });

                // Mark as watched
                const wat = modal.querySelector('.watchBtn');

                wat.addEventListener('click', (evt) => {
                    const film_id = evt.target.id.slice(2);
                    fetch(`/watched-film?id=${film_id}`)
                        .then(response => response.text())
                        .then(evt.target.disabled = true)
                })

                // Schedule
                const sched = modal.querySelector('.schBtn')

                sched.addEventListener('click', (evt) => {
                    const dt = document.querySelector('#schedDate').value;
                    const film_id = evt.target.id.slice(3);
                    const film_name = evt.target.name.slice(3);
                    fetch(`/schedule?id=${film_id}&name=${film_name}&date=${dt}`)
                        .then(response => response.text())
                        .then(evt.target.disabled = true)
                })
            }
        })
}

ReactDOM.render(<ClubButtons />, document.querySelector('#root'));
// ReactDOM.render(<ClubButtons />, document.querySelector('#button-div'));