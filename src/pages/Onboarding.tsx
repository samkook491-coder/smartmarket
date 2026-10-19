import { ArrowRight, ArrowUpRight, Leaf, MapPin, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import heroMarket from '../assets/hero-market.jpg'
import produceWatermark from '../assets/produce-watermark.jpg'

const slides = [
  { title: 'Votre marché local, livré chez vous', detail: 'Les bons produits du marché, directement auprès des vendeurs d’Abidjan.', icon: Leaf },
  { title: 'Vendeurs locaux vérifiés', detail: 'Découvrez les boutiques et les producteurs près de chez vous.', icon: Store },
  { title: '100% frais, prix marché', detail: 'Des produits de saison et des prix justes, en toute simplicité.', icon: MapPin },
]

export function Onboarding() {
  const [slide, setSlide] = useState(0)
  const { icon: Icon, title, detail } = slides[slide]

  return (
    <main className="onboarding-shell">
      <Link className="brand" to="/"><span className="brand-mark">S</span>Smartmarket</Link>
      <div className="onboarding-card">
        <div className={`onboarding-art${slide < 2 ? ` photo-art${slide === 1 ? ' produce-art' : ''}` : ''}`}>
          {slide < 2
            ? <><img src={slide === 0 ? heroMarket : produceWatermark} alt={slide === 0 ? 'Vendeuse souriante sur un marché de produits frais à Abidjan' : 'Sélection de légumes et produits frais du marché'} /><span className="photo-caption"><MapPin size={14} /> {slide === 0 ? 'Le marché d’Abidjan' : 'Des produits 100% frais'}</span></>
            : <><Icon size={72} strokeWidth={1.5} /><span className="art-spark">✳</span></>}
        </div>
        <span className="eyebrow">Le marché d’Abidjan, autrement</span>
        <h1>{title}</h1>
        <p>{detail}</p>
        <div className="slide-dots" aria-label={`Étape ${slide + 1} sur 3`}>
          {slides.map((item, index) => <button key={item.title} aria-label={`Afficher l’étape ${index + 1}`} className={index === slide ? 'current' : ''} onClick={() => setSlide(index)} />)}
        </div>
        {slide < 2
          ? <button className="button primary full" onClick={() => setSlide((current) => current + 1)}>Continuer <ArrowRight size={18} /></button>
          : <Link className="button primary full" to="/register">Commencer <ArrowUpRight size={18} /></Link>}
        <div className="onboarding-links"><span>Déjà inscrit·e ?</span><Link to="/login">Se connecter</Link></div>
      </div>
      <span className="onboarding-footnote">Fait avec soin, en Côte d’Ivoire <span>♥</span></span>
    </main>
  )
}
