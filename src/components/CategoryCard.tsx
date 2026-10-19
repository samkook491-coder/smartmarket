import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RAYONS } from '../lib/constants'

type Category = (typeof RAYONS)[number]

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link className="category-card" to={`/category/${category.slug}`}>
      <span className="category-emoji">{category.emoji}</span>
      <span>{category.name}</span>
      <ArrowUpRight size={16} />
    </Link>
  )
}
