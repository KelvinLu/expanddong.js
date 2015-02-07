var ExpandDong = {};

(function(ExpandDong){

    ExpandDong.create = function(container, expandRatio){
        // Check optional args
        if ((!expandRatio) || (expandRatio < 0) || (expandRatio > 1)) expandRatio = 0.667
        this._expandRatio = expandRatio;

        // Get list of panels and subelements
        panels = this._panels = [];

        for (var i = container.children.length - 1; i >= 0; i--) {
            if ((panelElem = container.children[i]).hasAttribute('panel')) {
                panelPreview = panelContent = null;

                for (var j = panelElem.children.length - 1; j >= 0; j--) {
                    panelChildElem = panelElem.children[j];

                    if (panelChildElem.hasAttribute('panel-preview')) {
                        panelPreview = panelChildElem;
                    } else if (panelChildElem.hasAttribute('panel-content')) {
                        panelContent = panelChildElem;
                    }
                };

                if ((panelPreview !== null) && (panelContent !== null)) {
                    panels.push({'panel': panelElem, 'preview': panelPreview, 'content': panelContent});
                }
            }
        };

        // Container properties
        containerWidth = this._containerWidth = container.clientWidth;
        eqWidth = containerWidth / panels.length;

        // Set starting CSS
        container.style.position = 'relative';
        container.style = 'discard';

        for (var i = panels.length - 1; i >= 0; i--) {
            // Sizing and positioning
            p = panels[i];
            p.panel.style.position = 'relative';
            p.panel.style.display = 'inline-block';
            p.panel.style.marginRight = '-4px';
            p.panel.style.height = '100%';
            p.panel.style.width = eqWidth;

            p.preview.style.position = p.content.style.position = "absolute";
            p.preview.style.top = p.preview.style.left = p.content.style.top = p.content.style.left = "0px";
            p.preview.style.height = p.preview.style.width = p.content.style.height = p.content.style.width = '100%';

            // Make all content transparent
            p.content.style.opacity = '0';
        };
    };

    
})(ExpandDong);