import { isBrowser } from '@/lib/utils';
import { useEffect } from 'react';

/**
 * スタイル調整用のパッチ
 */
const useAdjustStyle = () => {
  /**
   * callout に画像が含まれる場合に、親コンテナからはみ出すのを防ぐ
   */
  const adjustCalloutImg = () => {
    const callOuts = document.querySelectorAll('.notion-callout-text');
    callOuts.forEach((callout) => {
      const images = callout.querySelectorAll('figure.notion-asset-wrapper.notion-asset-wrapper-image > div');
      const calloutWidth = callout.offsetWidth;
      images.forEach((container) => {
        const imageWidth = container.offsetWidth;
        if (imageWidth + 50 > calloutWidth) {
          container.style.setProperty('width', '100%');
        }
      });
    });
  };

  useEffect(() => {
    if (isBrowser) {
      adjustCalloutImg();
      window.addEventListener('resize', adjustCalloutImg);
      return () => {
        window.removeEventListener('resize', adjustCalloutImg);
      };
    }
  }, []);
};

export default useAdjustStyle;
