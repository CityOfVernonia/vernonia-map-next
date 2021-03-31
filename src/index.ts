import esriConfig from '@arcgis/core/config';
import Portal from '@arcgis/core/portal/Portal';
import OAuthViewModel from 'cov/viewModels/OAuthViewModel';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import BingMapsLayer from '@arcgis/core/layers/BingMapsLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import Vernonia from 'cov/Vernonia';

import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';
import CalciteMeasure from 'cov/widgets/CalciteMeasure';

import TaxLotPopup from 'cov/popups/TaxLotPopup';

/**
 * Configure portal and auth.
 */
esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

const portal = new Portal();

const oAuthViewModel = new OAuthViewModel({
  portal,
  oAuthInfo: new OAuthInfo({
    portalUrl: esriConfig.portalUrl,
    appId: 'L8fvJsX7U6RlN1Pt',
    popup: true,
  }),
});

/**
 * Load the app.
 */
const loadApp = () => {
  const nextBasemap = new Basemap({
    thumbnailUrl:
      'https://gisportal.vernonia-or.gov/portal/sharing/rest/content/items/b6130a13beb74026b89960fbd424021f/info/thumbnail/thumbnail1579125721359.png',
    baseLayers: [
      new BingMapsLayer({
        style: 'aerial',
        key: 'Ao8BC5dsixV4B1uhNaUAK_ejjm6jtZ8G3oXQ5c5Q-WtmpORHOMklBvzqSIEXwdxe',
      }),
      new VectorTileLayer({
        portalItem: {
          id: 'f9a5da71cd61480680e456f0a3d4e1ce',
        },
      }),
    ],
  });

  const cityLimits = new FeatureLayer({
    portalItem: {
      id: 'eb0c7507611e44b7923dd1c0167e3b92',
    },
  });

  const ugb = new FeatureLayer({
    portalItem: {
      id: '2f760ba990ab4d6e831d04b85a8a0bf3',
    },
    visible: false,
  });

  const taxLots = new FeatureLayer({
    portalItem: {
      id: 'a6063eb199e640e0bbc2d5ceca23de9a',
    },
    popupTemplate: new TaxLotPopup(),
  });

  const view = new MapView({
    map: new Map({
      basemap: new Basemap({
        portalItem: {
          id: 'f36cd213cc934d2391f58f389fc9eaec',
        },
      }),
      layers: [taxLots, ugb, cityLimits],
      ground: 'world-elevation',
    }),
    zoom: 15,
    center: [-123.185, 45.859],
    constraints: {
      rotationEnabled: false,
    },
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: 'bottom-left',
        breakpoint: false,
      },
    },
  });

  cityLimits.when(() => {
    cityLimits
      .queryExtent({
        where: '1 = 1',
        outSpatialReference: {
          wkid: 102100,
        },
      })
      .then((extent: esri.Extent) => {
        view.goTo(extent);
      });
  });

  const app = new Vernonia({
    view,
    title: 'Vernonia Map',
    viewTitle: true,
    oAuthViewModel,
    widgets: [
      {
        placement: 'view',
        position: 'bottom-right',
        widget: new BasemapToggle({
          view,
          nextBasemap,
        }),
      },

      {
        placement: 'operational',
        title: 'Layers',
        icon: 'layers',
        widget: new LayerList({ view }),
      },
      {
        placement: 'operational',
        title: 'Legend',
        icon: 'legend',
        widget: new Legend({ view }),
      },
      {
        placement: 'operational',
        title: 'Measure',
        icon: 'measure',
        widget: new CalciteMeasure({ view }),
      },
    ],
    container: document.createElement('div'),
  });

  document.body.append(app.container);
};

portal.load().then(() => {
  oAuthViewModel.load().then(() => loadApp());
});
