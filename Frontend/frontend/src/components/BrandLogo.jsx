import React from 'react'
import logo from '../assets/logo.png'

const BrandLogo = ({ className = '', textSize = 'text-2xl', logoSize = 'h-10', isWhite = false }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img src={logo} alt="Hevaul AI Logo" className={`${logoSize} w-auto object-contain`} />
            <span className={`font-bold ${textSize} tracking-tight`}>
                <span className={isWhite ? "text-white" : "text-black"}>Hevaul</span>{' '}
                <span className={isWhite ? "text-blue-200" : "text-blue-600"}>
                    AI
                </span>
            </span>
        </div>
    )
}

export default BrandLogo
