import { siteConfig } from '@/lib/config';
import { useEffect, useState } from 'react';

const LoadingCover = ({ onFinishLoading }) => {
    const [isVisible, setIsVisible] = useState(true);
    const welcomeText = siteConfig('PROXIO_WELCOME_TEXT', '私たちのサイトへようこそ！');

    // カラー変数の定義
    const colors = {
        backgroundStart: '#1a1a1a', // ダークグレー
        backgroundMiddle: '#4d4d4d', // ミディアムグレー
        backgroundEnd: '#e6e6e6', // ライトグレー
        textColor: '#ffffff', // ホワイト
        rippleColor: 'rgba(255, 255, 255, 0.6)', // 半透明ホワイト
    };

    useEffect(() => {
        const pageContainer = document.getElementById('pageContainer');

        const handleClick = (e) => {
            // 拡散光圈（波紋）の作成
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            ripple.style.left = `${e.clientX - 10}px`;
            ripple.style.top = `${e.clientY - 10}px`;
            document.body.appendChild(ripple);

            // ページのズーム + ぼかしアニメーションの追加
            pageContainer?.classList?.add('page-clicked');

            // 読み込み完了をシミュレートし、コールバック関数を呼び出す
            setTimeout(() => {
                setIsVisible(false); // フェードアウトアニメーション
                setTimeout(() => {
                    if (onFinishLoading) {
                        onFinishLoading();
                    }
                }, 600); // フェードアウトアニメーションの完了を待機
            }, 1200);

            // ripple 要素のクリーンアップ
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        };

        document.body.addEventListener('click', handleClick);

        return () => {
            document.body.removeEventListener('click', handleClick);
        };
    }, [onFinishLoading]);

    if (!isVisible) return null;

    return (
        <div className="welcome" id="pageContainer">
            <div className="welcome-text px-2" id="welcomeText">
                {welcomeText}
            </div>
            <style jsx>
                {`
                    body {
                        margin: 0;
                        background-color: ${colors.backgroundStart};
                        height: 100vh;
                        overflow: hidden;
                        cursor: pointer;
                    }

                    .welcome {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        width: 100vw;
                        position: fixed;
                        top: 0;
                        left: 0;
                        z-index: 9999;
                        pointer-events: auto;
                        background: linear-gradient(120deg, ${colors.backgroundStart}, ${colors.backgroundMiddle}, ${colors.backgroundEnd});
                        background-size: 300% 300%;
                        animation: gradientShift 6s ease infinite;
                        transition: opacity 0.6s ease; /* フェードアウトアニメーション */
                    }

                    .welcome.page-clicked {
                        opacity: 0;
                        pointer-events: none;
                    }

                    .welcome-text {
                        font-size: 2.5rem;
                        font-weight: bold;
                        color: ${colors.textColor};
                        text-shadow: 0 0 15px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.6);
                        user-select: none;
                        animation: textPulse 3s ease-in-out infinite, fadeInUp 1.5s ease-out forwards;
                        text-align: center;
                        z-index: 10000; /* テキストのレイヤーを背景より前面に配置 */
                        position: relative;
                    }

                    .ripple {
                        position: absolute;
                        border-radius: 50%;
                        background: radial-gradient(${colors.rippleColor} 0%, transparent 70%);
                        pointer-events: none;
                        width: 20px;
                        height: 20px;
                        transform: scale(0);
                        opacity: 0.8;
                        z-index: 10;
                        animation: rippleExpand 1s ease-out forwards;
                    }

                    /* 動的背景アニメーション */
                    @keyframes gradientShift {
                        0% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }

                    /* テキスト呼吸アニメーション */
                    @keyframes textPulse {
                        0%, 100% {
                            transform: scale(1);
                            text-shadow: 0 0 15px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.6);
                        }
                        50% {
                            transform: scale(1.1);
                            text-shadow: 0 0 25px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.8);
                        }
                    }

                    /* テキストフェードインアニメーション */
                    @keyframes fadeInUp {
                        0% {
                            opacity: 0;
                            transform: translateY(50px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    /* 拡散光圈（波紋）アニメーション */
                    @keyframes rippleExpand {
                        to {
                            transform: scale(40);
                            opacity: 0;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default LoadingCover;