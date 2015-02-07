var ExpandDong = {};

(function(ExpandDong){

    Panels = ExpandDong.Panels = function(container, options){
        // Load options
        this.options = {
            'expandRatio':  0.667,
            'resizeRatio':  0.1,
            'resizeTime':   10,
            'trigger': 'click',
        }
        if ((options) && (options instanceof Object)) for (option in options) if (options.hasOwnProperty(option))
            this.options[option] = options[option];

        // Set active panel
        this._activePanelIndex = null;
        this._pristine = true;

        // Get list of panels and subelements
        panels = this._panels = [];

        for (var i = 0; i < container.children.length; i++) {
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
                    panels.push({
                        'panel': panelElem, 
                        'preview': panelPreview, 
                        'content': panelContent, 
                    });
                }
            }
        };

        // Container properties
        containerWidth = this._containerWidth = container.clientWidth;
        eqWidth = (containerWidth - 1)/ panels.length;

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

        // Set width arrays
        this._currentWidths = Array.apply(null, Array(panels.length)).map(function(){ return eqWidth; });
        this._desiredWidths = this._currentWidths.slice();

        // Bind listeners
        panelsContext = this;

        createActivator = function(index) {
            var index_container = {'index': index};

            return (function(){
                this.activate(index_container.index);
            }).bind(panelsContext);
        };

        for (var i = this._panels.length - 1; i >= 0; i--) {
            panel = this._panels[i].panel;
            panel.addEventListener(this.options.trigger, createActivator(i));
        };
    };

    Panels.prototype.activate = function(index){
        this._activePanelIndex = index;

        if ((index < 0) || (index >= this._panels.length)) return;
        activeWidth = (this._containerWidth - 1) * this.options.expandRatio;
        inactiveWidth = (this._containerWidth - 1 - activeWidth) / (this._panels.length - 1);
        this._desiredWidths = Array.apply(null, Array(this._panels.length)).map(function(){ return inactiveWidth; });
        this._desiredWidths[index] = activeWidth;

        this._resize();
    };

    Panels.prototype.deactivate = function(){
        this._activePanelIndex = null;

        eqWidth = (this._containerWidth - 1)/ this._panels.length;
        this._desiredWidths = Array.apply(null, Array(panels.length)).map(function(){ return eqWidth; });

        this._resize(reset = true);
    };

    Panels.prototype._resize = function(reset){
        // Fancy calculations
        currentWidths = this._currentWidths;
        differences = this._desiredWidths.map(function(d, d_i){ return d - currentWidths[d_i]; });

        resizeRatio = this.options.resizeRatio;
        growths = differences.map(function(d){ return (d > 0) ? (d * resizeRatio) : 0; });
        shrinks = differences.map(function(d){ return (d < 0) ? (d * resizeRatio) : 0; });

        sum_reduce = function(acc, cur){ return acc + cur; };
        delta = growths.reduce(sum_reduce, 0) + shrinks.reduce(sum_reduce, 0);
        abs_delta = growths.reduce(sum_reduce, 0) - shrinks.reduce(sum_reduce, 0);

        compensate = delta / this._panels.length;
        compensator = function(d){ return d + compensate; };
        growths = growths.map(compensator);
        shrinks = shrinks.map(compensator);

        this._currentWidths = currentWidths.map(function(d, d_i){ return d + growths[d_i] + shrinks[d_i]; });

        // Set panel...
        for (var i = this._currentWidths.length - 1; i >= 0; i--) {
            p = this._panels[i]

            // ... widths
            p.panel.style.width = this._currentWidths[i];

            // ... opacities
            opacity_delta = (growths[i] - shrinks[i]) / this._containerWidth * 100;
            if (i === this._activePanelIndex) {
                p.preview.style.opacity = Math.log(opacity_delta);
                p.content.style.opacity = 1 - Math.log(opacity_delta);
            } else if (this._pristine == false) {
                p.preview.style.opacity = 1 - Math.log(opacity_delta);
                p.content.style.opacity = Math.log(opacity_delta);           
            }
        }

        // Recursive event loop call
        if (abs_delta > 1) setTimeout(this._resize.bind(this), this.options.resizeTime);
        else if (reset) this._pristine = true;
        else  this._pristine = false;
    };

})(ExpandDong);