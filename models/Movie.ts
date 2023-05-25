export interface Movie {
  id?: number
  title: string
  release_year: number
  categories?: Category[]
}

export interface Category {
  id: number
  name: string
  movies?: Movie[]
}
