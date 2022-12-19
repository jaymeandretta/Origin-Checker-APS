class OriginCheckExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._button = null;
    this._onObjectTreeCreated = (ev) => this.onModelLoaded(ev.model);
  }

  async onModelLoaded(model) {
    this.dataVizExtn = await this.viewer.getExtension("Autodesk.DataVisualization");
  }

  async load() {
    this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this._onObjectTreeCreated);
    return true;
  }

  unload() {
    if (this._button) {
      this.removeToolbarButton(this._button);
      this._button = null;
    }
    return true;
  }

  onToolbarCreated() {
    this._button = this.createToolbarButton('coordinatesextension-button', 'https://img.icons8.com/small/30/null/place-marker.png', 'Filter Model Based on Query');
    this._button.onClick = () => {
      if (this._button.getState() == Autodesk.Viewing.UI.Button.State.INACTIVE) {
        this._button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
        this.renderCoordinates.call(this);
      }
      else {
        this._button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
        this.dataVizExtn.removeAllViewables();
      }
    };
  }

  async renderCoordinates() {
    if (!this.coordinates)
      return;

    let DataVizCore = Autodesk.DataVisualization.Core;
    let viewableType = DataVizCore.ViewableType.SPRITE;
    // let correctSpriteColor = new THREE.Color("rgb(0,153,51)");
    // let wrongSpriteColor = new THREE.Color("rgb(255,0,0)");
    let correctSpriteColor = new THREE.Color(0xffffff);
    let wrongSpriteColor = new THREE.Color(0xffffff);
    let correctSurveyPointSpriteIconUrl = "data:image/png;base64,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";
    let correctBasePointSpriteIconUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAEeElEQVRogd2aX4iUVRjGf+/5ZmdL7Q9pmFhhsCjbGuxVWFBkl2k3CXuxM2vYikEXXkQQKLZGNwZppEhYlOE6SxgpkXUR0UUUaSGu4Di761BkihakZqs1O/Odt4t1K01333Pm2y58YC9m5nne533mPXO+830s3CCQTKu9s+iWJC/LVVgq0KnKAoTbAVDOi8gPih4RkS/SP/0n9A7/npV1NkH62+c54SXQlcAMo+oSogPe516lp1xttoXmgmxta3Wzk/WoPA/MjKxSR3WLP5f2sbZai20lPsjAwjmJdx8qPBpd48pGvknryVOsKp+J1EdgV/ti5/ynIPdE6a+PE97LMlZWjoYKw4MMLJ7rfP27aQgxgRPe5R6k++jPISIXZLFzwU2Jb+ybxhAA9ya+sZetba0hoqAgLt+6TuGhsL7CofCwuyPXF6KxL63+9nlO9Djxu1Moxrz4dgoj31vI5omMXyf+txAAeefdi1aybSJ7Oma5sfQ0MCu2q0hc9PnkLrrKo1MRTRNJaumThIRQasBW790S7/Ozxv/cEmDb5c+smJnUGk9YiDlTX8LSAPNTHr+M4siRq94/6OEgpY53nab7gfk2b3kc2DMVzzQRgU4LD6Xm1S+j5z8h/kGhPOglWW6djNXbFEThPgsPYcekISZQKA/ieDtLb+uudauF5MWXjPXwKjaucpuFZguiqInX0nLMxAPIO9t5SvAWmi2IcN7EC8FYzboaTN7WYudMrHr9fmM9oMXKPWsh2X7synFTMXVFCw/AiRZM3jBsqmchiWBbz8oaSh1Tb5eljk6UNSZvbN62IKqDFh5Cq9N0/6RhSh2dly+IeaP3IZu1BXva7nRjuTPYf1NjCG95ldLfu1MjfcAp3ZcnYQoBNDyN2RSrF6Yimo/xbveiwyC2K3xGEJWv0p7KIxau/cZK+Di6o0io04+sXHMQLzoQ10401CMfWMn2iXSPDKEcjmopAqJ8SaHyo5Uf9vDBqemglwlE3gyhBwXxLbl+4LeghuJwOr04Y2+IIGwiXeVR0J1Bmijodp49VA9RhAUBPOnmwNvVUFzw9Zu3h4qCg1CsnkR4L1hnhmxj1WDwaTs8COBT/wpwMUY7Bc76vNsSI4wKwtMjp4DNUdrJoPTRVTYd269GXBDA50c3gf4Uq78Ghv2lmTtixdFB6Dr5hyAbovVXQeCF0J3q34gPAqTVoX4B0zF7Mih8nhaH9jdTo6kgbMSnkqwGor9J4JKKPNdUHzQbBMafUcFr0XplA4WK6VZ6MjQfBPBnGy8D5VCdIN/61qE3sughkyCsrdY8shpIzRqlljp5hq4AzSTIJghAsXIAZJOZL6yn+1jwFK+H7IIAfv7cjQJfT8VT+MxXh17P0jvbf+EA2N12tyM3CMy+DuMXr9JJT+V0lraZTgSAYvWkiPbCNZ8Xp06lmHUIgCTrggC699dhWTEH4LErPhBZlxYru6bDM/ulNQFFXKn9fdCu8Zfs08LQCsT4ZD8Q2S+tCQjq865X4KDAAc0nK6crxA2FvwCIIXomof2g0gAAAABJRU5ErkJggg==";
    let modelSurveyPointSpriteIconUrl = "data:image/png;base64,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";
    let modelBasePointSpriteIconUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAEb0lEQVRogeWaX4iUZRTGf+ebdcednXU3zEq0VJo1zISFIMwoMuiitJsuS7xI8aLLCIJEpbuC6iKJqKCCUKjIkKyLiogISmNxhcx2d/yTrGgGZs7s2uyf9+lidyWW2j3vO992Uc/lzHPOc5457/t975+B/wgsz2S/3kZHW2CzlG2UqcfESqBr6uvLBqeFHUPhyz9a+GRJP7W8tHMxMryGpWE0241pK1Byho2A7Q8KL3SepNpsDU0ZUYViXdlOMz0laE9MM2bYy+2EPValkVpLspErq7negn0I3JeaYwa+tXE9Wj7DhZTgJCO1W7kDs0+Bm1PiZ8FZpE0dJ/khNjDaSH0VN6pg35O/iWmctQndVT7NLzFBWQxZK1mogn3E/JkAuEUFO6AKxZigKCP1QvYscHdUWWnYMEy2JybAPbSG17BUYzbYxNMpFqMTmdZ0DXDKQ3Z3JIxmu/9FEwCtBWXPeMmujlxcS7mtYeeBcnJZCTAYHinqphuOU5+L6+pIaZRHiDPRQPZKMK0fLqk8XFI5mNZjthf8Lz1Be1uDhz3cFldCZRtBXv1zlmlTeUDHZnx+GMLhejdvSXYIWObKpuwBCO/PRXN1RKYelyg0Jk0w08Q1lAfpM9NmnJ0xp7bLiIlVHh6y12czMY3yIH1gb7pS4tP2PrUWeUihEPY58xFwczs9JK8R1wRpLOBHZz4aRfd6KnhIXiOXnTw3Cg2ntnzaXiO/eUjFMW535qMFJ9e45KH5JjsMupIp2+LhTQpnj7uIot+XzwXzjWdpR72bOR+Xkxzt8En7tH3vEUKfSxSKkh2azUy9m56pF2KrU7vXw3OttWoVloBdwD+nRsHeCIR900+nhQ3WGdljU51wmQDGR9HixVWuzEV0L+NrFTsKcw+bXGF80zGoez1U/8ZK9nFyQYmwoINertuICmF/WjnJUCHwgZfsNrJogJ+Ao0klpeHrttP87CVH7dlBroVeLpBei6FHGbla5F3g96iCUiDOl7s4EBMSZWRyy2lvx1WVAr1qvYzFREQf0I1UWD6BVSHu3CkCV8bHteK6M3EL1cg5AqUqQ8jeiY1zw2xvrAlIPPsdWc2yEKx/Ho6HLoWiujuP+1a8f0V0RwBKA5wT9lJK7KyQ9qSYgCauFbSctvpC6yevc2DRX+7SuthJPo2kjgDYEFdN2pUaPxPK9HSqCWj2xgqyesWOAHc2kwfxRcdJPdhMiuSOABgEM22H9F8SGAnSk83UAU0agakDN+zF1HhDuzpP+bbSs+fJAapQrGO9wNpI8SPtVW0wmGi2hqY7AmBVGgFtJ66ghtATeZiAnIwAdFb5DrPnvXyTdnZUOZ6Xfq7/fND9tNSH7Cvgnjmon5Wresicp4ge5GoEri0q+4DF/0C5mC1QT/sJzuepm9vQmkapypDQNv7+vHjCTFvyNgHzYARgUZWDoOdmfi60szzI5/OhOW8QWK2SvVermGoVU63bDmgehvI0XFdvKTDQxWLYVmrYCoGutmprR8T93f8WfwJ8g4UdO1ilXAAAAABJRU5ErkJggg==";

    let correctBasePointStyle = new DataVizCore.ViewableStyle(viewableType, correctSpriteColor, correctBasePointSpriteIconUrl);
    let wrongBasePointStyle = new DataVizCore.ViewableStyle(viewableType, wrongSpriteColor, modelBasePointSpriteIconUrl);
    let correctSurveyPointStyle = new DataVizCore.ViewableStyle(viewableType, correctSpriteColor, correctSurveyPointSpriteIconUrl);
    let wrongSurveyPointStyle = new DataVizCore.ViewableStyle(viewableType, wrongSpriteColor, modelSurveyPointSpriteIconUrl);

    this.viewableData = new DataVizCore.ViewableData();
    this.viewableData.spriteSize = 32; // Sprites as points of size 24 x 24 pixels

    let correctBasePointPosition = {
      x: this.coordinates.correctBasePoint.x - this.viewer.model.getGlobalOffset().x,
      y: this.coordinates.correctBasePoint.y - this.viewer.model.getGlobalOffset().y,
      z: this.coordinates.correctBasePoint.z - this.viewer.model.getGlobalOffset().z
    }
    this.addViewableSprite(DataVizCore, this.viewableData, correctBasePointPosition, correctBasePointStyle, 1000000, this.coordinates.correctBasePoint);

    let correctSurveyPoint = {
      x: this.coordinates.correctSurveyPoint.x - this.viewer.model.getGlobalOffset().x,
      y: this.coordinates.correctSurveyPoint.y - this.viewer.model.getGlobalOffset().y,
      z: this.coordinates.correctSurveyPoint.z - this.viewer.model.getGlobalOffset().z
    }
    this.addViewableSprite(DataVizCore, this.viewableData, correctSurveyPoint, correctSurveyPointStyle, 1000001, this.coordinates.correctSurveyPoint);

    let modelBasePoint = {
      x: this.coordinates.modelBasePoint.x - this.viewer.model.getGlobalOffset().x,
      y: this.coordinates.modelBasePoint.y - this.viewer.model.getGlobalOffset().y,
      z: this.coordinates.modelBasePoint.z - this.viewer.model.getGlobalOffset().z
    }
    this.addViewableSprite(DataVizCore, this.viewableData, modelBasePoint, wrongBasePointStyle, 1000002, this.coordinates.modelBasePoint);

    let modelSurveyPoint = {
      x: this.coordinates.modelSurveyPoint.x - this.viewer.model.getGlobalOffset().x,
      y: this.coordinates.modelSurveyPoint.y - this.viewer.model.getGlobalOffset().y,
      z: this.coordinates.modelSurveyPoint.z - this.viewer.model.getGlobalOffset().z
    }
    this.addViewableSprite(DataVizCore, this.viewableData, modelSurveyPoint, wrongSurveyPointStyle, 1000003, this.coordinates.modelSurveyPoint);

    this.viewableData.finish().then(() => {
      this.dataVizExtn.addViewables(this.viewableData);
    });

    this.viewer.addEventListener(DataVizCore.MOUSE_HOVERING, this.onSpriteHovering.bind(this));
  }

  onSpriteHovering(event) {
    const targetDbId = event.dbId;

    let currentSpriteData = this.viewableData._viewablesMap.get(targetDbId).myContextData;
    if (event.hovering) {
      console.log(`The mouse hovers over ${targetDbId}`);
    } else {
      console.log(`The mouse hovers off ${targetDbId}`);
    }
    console.log(`Coordinates ${currentSpriteData}`);
  }

  addViewableSprite(DataVizCore, viewableData, position, style, dbId, revitPoint) {
    const viewable = new DataVizCore.SpriteViewable(new THREE.Vector3(position.x, position.y, position.z), style, dbId);
    viewable.myContextData = {
      x: revitPoint.x,
      y: revitPoint.y,
      z: revitPoint.z,
    };
    viewableData.addViewable(viewable);
  }

  createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
    let group = this.viewer.toolbar.getControl('coordinates-toolbar-group');
    if (!group) {
      group = new Autodesk.Viewing.UI.ControlGroup('coordinates-toolbar-group');
      this.viewer.toolbar.addControl(group);
    }
    const button = new Autodesk.Viewing.UI.Button(buttonId);
    button.setToolTip(buttonTooltip);
    group.addControl(button);
    const icon = button.container.querySelector('.adsk-button-icon');
    if (icon) {
      icon.style.backgroundImage = `url(${buttonIconUrl})`;
      icon.style.backgroundSize = `24px`;
      icon.style.backgroundRepeat = `no-repeat`;
      icon.style.backgroundPosition = `center`;
    }
    return button;
  }

  removeToolbarButton(button) {
    const group = this.viewer.toolbar.getControl('coordinates-toolbar-group');
    group.removeControl(button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('OriginCheckExtension', OriginCheckExtension);