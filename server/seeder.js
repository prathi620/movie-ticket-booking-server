const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const Showtime = require('./models/Showtime');
const User = require('./models/User');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await Movie.deleteMany();
        await Theater.deleteMany();
        await Showtime.deleteMany();
        await User.deleteMany();

        const movies = await Movie.insertMany([
            {
                title: 'Deadpool & Wolverine',
                description: 'Deadpool is offered a place in the Marvel Cinematic Universe by the Time Variance Authority, but instead recruits a variant of Wolverine to save his universe from extinction.',
                genre: ['Action', 'Comedy', 'Sci-Fi'],
                language: 'English',
                releaseDate: new Date('2024-07-26'),
                duration: 128,
                posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
                rating: 7.8
            },
            {
                title: 'Wicked',
                description: 'The story of how a green-skinned woman framed by the Wizard of Oz becomes the Wicked Witch of the West. The first of a two-part feature film adaptation of the Broadway musical.',
                genre: ['Fantasy', 'Musical', 'Romance'],
                language: 'English',
                releaseDate: new Date('2024-11-22'),
                duration: 160,
                posterUrl: 'https://image.tmdb.org/t/p/w500/c5Tqxeo1UpBvnAc3csUm7j3hlQl.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg',
                rating: 7.7
            },
            {
                title: 'Moana 2',
                description: 'After receiving an unexpected call from her wayfinding ancestors, Moana journeys to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she has ever faced.',
                genre: ['Animation', 'Adventure', 'Family'],
                language: 'English',
                releaseDate: new Date('2024-11-27'),
                duration: 100,
                posterUrl: 'https://image.tmdb.org/t/p/w500/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg',
                rating: 7.0
            },
            {
                title: 'Mufasa: The Lion King',
                description: 'Rafiki relays the legend of Mufasa to young lion cub Kiara, daughter of Simba and Nala. Told in flashbacks, the story introduces Mufasa as an orphaned cub, lost and alone until he meets a sympathetic lion named Taka.',
                genre: ['Animation', 'Adventure', 'Family'],
                language: 'English',
                releaseDate: new Date('2024-12-20'),
                duration: 118,
                posterUrl: 'https://image.tmdb.org/t/p/w500/lurEK87kukWNaHd0zYnsi3yzJrs.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/3VSWAzGTZNgLYbt3Nc9wVLPcyL.jpg',
                rating: 7.2
            },


            {
                title: 'Dune: Part Two',
                description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
                genre: ['Sci-Fi', 'Adventure'],
                language: 'English',
                releaseDate: new Date('2024-03-01'),
                duration: 166,
                posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
                rating: 8.7
            },
            {
                title: 'Inside Out 2',
                description: 'A sequel that features Riley entering puberty and experiencing brand new, more complex emotions as a result. As Riley tries to adapt to her teenage years, her old emotions try to adapt to the possibility of being replaced.',
                genre: ['Animation', 'Family', 'Adventure'],
                language: 'English',
                releaseDate: new Date('2024-06-14'),
                duration: 96,
                posterUrl: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
                rating: 7.6
            },
            {
                title: 'Venom: The Last Dance',
                description: 'Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on Venom and Eddie\'s last dance.',
                genre: ['Action', 'Sci-Fi', 'Thriller'],
                language: 'English',
                releaseDate: new Date('2024-10-25'),
                duration: 109,
                posterUrl: 'https://image.tmdb.org/t/p/w500/k42Owka8v91trK1qMYwCQCNwJKr.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg',
                rating: 6.8
            },
            {
                title: 'Oppenheimer',
                description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
                genre: ['Biography', 'Drama', 'History'],
                language: 'English',
                releaseDate: new Date('2023-07-21'),
                duration: 180,
                posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
                rating: 8.3
            },
            {
                title: 'Terrifier 3',
                description: 'Art the Clown is set to unleash chaos on the unsuspecting residents of Miles County as they peacefully drift off to sleep on Christmas Eve.',
                genre: ['Horror', 'Thriller'],
                language: 'English',
                releaseDate: new Date('2024-10-11'),
                duration: 125,
                posterUrl: 'https://image.tmdb.org/t/p/w500/7NDHoebflLwL1CcgLJ9wZbbDrmV.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/18TSJF1WLA4CkymvVUcKDBwUJ9F.jpg',
                rating: 7.0
            },
            {
                title: 'Red One',
                description: 'After Santa Claus is kidnapped, the North Pole\'s Head of Security must team up with the world\'s most infamous bounty hunter in a globe-trotting, action-packed mission to save Christmas.',
                genre: ['Action', 'Comedy', 'Fantasy'],
                language: 'English',
                releaseDate: new Date('2024-11-15'),
                duration: 123,
                posterUrl: 'https://image.tmdb.org/t/p/w500/cdqLnri3NEGcmfnqwk2TSIYtddg.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/uKb22E0nlzr914bA9KyA5CVCOlV.jpg',
                rating: 6.9
            },
            {
                title: 'A Quiet Place: Day One',
                description: 'A prequel detailing the origin of the creatures in "A Quiet Place."',
                genre: ['Horror', 'Sci-Fi', 'Thriller'],
                language: 'English',
                releaseDate: new Date('2024-06-28'),
                duration: 99,
                posterUrl: 'https://image.tmdb.org/t/p/w500/hU42CRk14JuPEdqZG3AWmagiPAP.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/2RVcJbWFmICRDsVxRI8F5xRmRsK.jpg',
                rating: 6.9
            },

            {
                title: 'The Wild Robot',
                description: 'A robot named Roz is stranded on an uninhabited island and must learn to adapt to the harsh surroundings, gradually building relationships with the animals on the island and becoming the adoptive parent of an orphaned gosling.',
                genre: ['Animation', 'Sci-Fi', 'Family'],
                language: 'English',
                releaseDate: new Date('2024-09-27'),
                duration: 102,
                posterUrl: 'https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/4zlOPT9CrtIX05bBIkYxNZsm5zN.jpg',
                rating: 8.5
            },
            {
                title: 'Kraven the Hunter',
                description: 'Kraven\'s complex relationship with his ruthless father, Nikolai Kravinoff, starts him down a path of vengeance with brutal consequences, motivating him to become not only the greatest hunter in the world, but also one of its most feared.',
                genre: ['Action', 'Adventure', 'Thriller'],
                language: 'English',
                releaseDate: new Date('2024-12-13'),
                duration: 127,
                posterUrl: 'https://image.tmdb.org/t/p/w500/1GvBhRxY6MELDfxFrete6BNhBB5.jpg',
                backdropUrl: 'https://image.tmdb.org/t/p/original/v9acaWVVFdZT5yAU7J2QjwfhXyD.jpg',
                rating: 6.2
            }
        ]);

        const theaters = await Theater.insertMany([
            {
                name: 'Grand Cinema',
                location: 'Downtown',
                city: 'New York',
                screens: [
                    {
                        name: 'Screen 1',
                        rows: 8,
                        cols: 10,
                        pricing: { standard: 12, premium: 15, vip: 20 },
                        seatLayout: []
                    },
                    {
                        name: 'Screen 2',
                        rows: 6,
                        cols: 8,
                        pricing: { standard: 10, premium: 12, vip: 15 },
                        seatLayout: []
                    }
                ]
            },
            {
                name: 'Starplex',
                location: 'Mall',
                city: 'Los Angeles',
                screens: [
                    {
                        name: 'IMAX',
                        rows: 10,
                        cols: 12,
                        pricing: { standard: 18, premium: 25, vip: 30 },
                        seatLayout: []
                    },
                    {
                        name: 'Screen 4',
                        rows: 7,
                        cols: 9,
                        pricing: { standard: 12, premium: 20, vip: 25 },
                        seatLayout: []
                    }
                ]
            }
        ]);

        // Helper to generate seats
        const generateSeats = (rows, cols, basePrice) => {
            const seats = [];
            for (let r = 0; r < rows; r++) {
                let seatType = 'standard';
                let seatPrice = basePrice;

                // Make last row VIP, second last Premium
                if (r === rows - 1) {
                    seatType = 'vip';
                    seatPrice = basePrice + 100;
                } else if (r === rows - 2) {
                    seatType = 'premium';
                    seatPrice = basePrice + 50;
                }

                if (seatType !== 'standard') {
                    console.log(`Generating ${seatType} seats for Row ${r} (Rows: ${rows})`);
                }

                for (let c = 0; c < cols; c++) {
                    const rowChar = String.fromCharCode(65 + r); // A, B, C...
                    const seatNum = `${rowChar}${c + 1}`; // A1, A2...
                    seats.push({
                        seatNumber: seatNum,
                        row: r,
                        col: c,
                        type: seatType,
                        price: seatPrice,
                        status: 'available'
                    });
                }
            }
            return seats;
        };

        // Create Showtimes
        const showtimes = [];

        // Helper to add showtimes
        const addShowtime = (movieIdx, theaterIdx, screenName, dayOffset, hour, minute, rows, cols, price) => {
            const date = new Date();
            date.setDate(date.getDate() + dayOffset);
            date.setHours(hour, minute, 0, 0);

            showtimes.push({
                movie: movies[movieIdx]._id,
                theater: theaters[theaterIdx]._id,
                screenName: screenName,
                startTime: date,
                endTime: new Date(date.getTime() + movies[movieIdx].duration * 60000),
                seats: generateSeats(rows, cols, price)
            });
        };

        // Generate PERMANENT showtimes for next 2 days for ALL movies
        // This ensures showtimes are always available and unique per movie
        for (let i = 0; i < 2; i++) {
            movies.forEach((movie, mIndex) => {
                // Determine theater and screen based on movie index
                const theaterIdx = mIndex % 2;
                const screenIdx = (Math.floor(mIndex / 2)) % 2;

                const theater = theaters[theaterIdx];
                const screen = theater.screens[screenIdx] || theater.screens[0];

                // Define ALL available time slots
                const allTimeSlots = [
                    [10, 0], [10, 30], [11, 0], [11, 30], [12, 0], [13, 0],
                    [13, 30], [14, 0], [14, 30], [15, 0], [16, 0], [16, 30],
                    [17, 0], [17, 30], [18, 0], [19, 0], [19, 30], [20, 0],
                    [20, 30], [21, 0]
                ];

                // Each movie gets UNIQUE time slots based on its index
                // This ensures different movies have different showtimes
                const slot1Idx = (mIndex * 3) % allTimeSlots.length;
                const slot2Idx = (mIndex * 3 + 7) % allTimeSlots.length;
                const slot3Idx = (mIndex * 3 + 14) % allTimeSlots.length;

                const [hour1, min1] = allTimeSlots[slot1Idx];
                const [hour2, min2] = allTimeSlots[slot2Idx];
                const [hour3, min3] = allTimeSlots[slot3Idx];

                console.log(`Day ${i}, Movie ${mIndex} (${movie.title}): ${hour1}:${min1}, ${hour2}:${min2}, ${hour3}:${min3}`);

                // Add 3 different showtimes per day for each movie
                addShowtime(mIndex, theaterIdx, screen.name, i, hour1, min1, screen.rows, screen.cols, screen.pricing.standard);
                addShowtime(mIndex, theaterIdx, screen.name, i, hour2, min2, screen.rows, screen.cols, screen.pricing.standard);
                addShowtime(mIndex, theaterIdx, screen.name, i, hour3, min3, screen.rows, screen.cols, screen.pricing.premium);
            });
        }

        await Showtime.insertMany(showtimes);

        // Create Test User
        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123', // Will be hashed by pre-save hook in User model usually, checking model
            isAdmin: false
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
