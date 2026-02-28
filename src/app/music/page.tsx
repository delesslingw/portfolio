import { getAllSongs } from '@/lib/songs'
export default async function Music() {
  const songs = await getAllSongs()
  console.log(songs)
  return songs.map((song) => {
    return <h1 key={song.slug}>{song.name}</h1>
  })
}
