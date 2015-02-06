'use strict';

var visual={
    init:function(){
        visual.tip=d3.tip()
            .attr('class','tooltip')
            .html(function(d){
                return '<div class="title">'+d.page+'</div>'+
                    '<div class="subtle">'+(d.get ? '✓':'✕')+'</div>'+
                    '<div class="subtle">'+d.mime+'</div>';
            })
            .direction('n');

        visual.zoom=d3.behavior.zoom().on('zoom',function(){
                visual.vis.attr('transform',
                    'translate('+d3.event.translate+')'+
                    'scale('+d3.event.scale+')');
            });
    
        visual.canvas=document.getElementById('canvas');

        visual.vis=d3.select('#canvas')
            .append('svg:svg')
            .attr('width','100%')
            .attr('height','100%')
            .attr('pointer-events','all')
            .call(visual.zoom)
            .call(visual.tip);

        visual.vlinks=visual.vis
            .append('svg:g')
                .attr('class','links');

        visual.vnodes=visual.vis
            .append('svg:g')
                .attr('class','nodes');

        visual.lateral=d3.select('#canvas')
            .append('svg:svg')
            .attr('width','250px');

        visual.legend=visual.lateral.append('svg:g');

        visual.link;
        visual.node;
        visual.force=d3.layout.force()
            .size([
                visual.canvas.clientWidth,
                visual.canvas.clientHeight])
            .linkDistance(200)
            .linkStrength(1)
            .friction(0.5)
            .charge(-2000)
            .gravity(0.1)
            .on('tick',visual.tick);

        visual.drag=visual.force.drag()
            .on('dragstart',function(d){
                d3.event.sourceEvent.stopPropagation();
                d3.select(this).classed('fixed',d.fixed=true);
            });
    }
  , tick:function(){
        visual.link.attr('x1',function(d){
                return d.source.x;
            })
            .attr('y1',function(d){
                return d.source.y;
            })
            .attr('x2',function(d){
                return d.target.x;
            })
            .attr('y2',function(d){
                return d.target.y;
            });
        visual.node.call(function(){
            this.attr('transform',function(d){
                return 'translate('+d.x+','+d.y+')';
            });
        });
    }
  , set:function(nodes,links){
        visual.nodes=nodes;
        visual.links=links;

        nodes[0].x=~~(visual.canvas.clientWidth/2)-9;
        nodes[0].y=~~(visual.canvas.clientHeight/2)-9;
        nodes[0].fixed=true;

        visual.adjacency1={}
        visual.adjacency2={}
        visual.links.forEach(function(d){
            visual.adjacency1[d.source.index+'_'+d.target.index]=true;
            visual.adjacency2[d.target.index+'_'+d.source.index]=true;
        });
    }
  , linked:function(e,r){
        return (e.index+'_'+r.index) in visual.adjacency1;
    }
  , linkin:function(e,r){
        return (e.index+'_'+r.index) in visual.adjacency2;
    }
  , draw:function(){
        visual.link=visual.vis.select('.links').selectAll('line')
            .data(visual.links,function(d,i){
                return i;
            });
        visual.node=visual.vis.select('.nodes').selectAll('circle')
            .data(visual.nodes,function(d,i){
                return i;
            });

        visual.link
            .enter()
            .append('line')
            .attr('class','link')
        visual.link
            .exit()
            .remove();

        visual.node
            .enter()
            .append('circle')
                .attr('r',function(d){
                    switch(d.type){
                        case 'root':
                            return 18;
                        case 'page':
                            return 12;
                        default:
                            return 6;
                    }
                })
                .attr('class',function(d){
                    return [
                        'node'
                      , d.type
                      , (function(status){return 's-'+~~(status/100);})(d.status)
                      , (function(mime){return 'm-'+mime.replace('/','-');})(d.mime)
                    ].join(' ');
                })
                .on('dblclick',function(d){
                    d3.select(this).classed('fixed',d.fixed=false);
                })
                .on('mouseover',function(e){
                    visual.tip.show(e);
                    visual.link.classed('highlighted1',function(r){
                        return r.source.index==e.index ? true:false;
                    });
                    visual.link.classed('highlighted2',function(r){
                        return r.target.index==e.index ? true:false;
                    });
                })
                .on('mouseout',function(e){
                    visual.tip.hide(e);
                    visual.node.style('opacity',1);
                    visual.link.classed('highlighted1',false);
                    visual.link.classed('highlighted2',false);
                })
            .call(visual.drag);
        visual.node
            .exit()
            .remove();

        visual.force
            .nodes(visual.nodes)
            .links(visual.links)
            .start();
    }
  , panel:function(){
        var dict={}
          , mimes=new Array()

        visual.nodes.forEach(function(n){
            if(!(n.mime in dict)){
                dict[n.mime]=1;
                mimes.push(n.mime);
            }else{
                dict[n.mime]++;
            }
        });

        visual.legend=visual.legend.selectAll('.legend')
            .data(mimes.sort())
            .enter().append('g')
            .attr('class','legend')
            .attr('transform',function(d,i){
                return 'translate(0,'+i*22+')';});

        visual.legend.append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('width',14)
            .attr('height',14)
            .attr('class',function(d){
                return 'm-'+d.replace('/','-');
            });

        visual.legend.append('text')
            .attr('x',20)
            .attr('y',11)
            .attr('width',180)
            .attr('height',14)
            .text(function(d){return d;});

        visual.legend.append("text")
            .attr('x',230)
            .attr('y',11)
            .style('text-anchor','end')
            .text(function(d){return dict[d];});

        visual.lateral.attr('height',(mimes.length*22+4)+'px');
    }
  , load:function(url){
        d3.json(url,function(data){
            visual.init();
            visual.set(data.nodes,data.links)
            visual.draw();
            visual.panel();
        });
    }
  , add:function(){
        visual.nodes.push({
            page:'/vlm/node'
          , status:200,mime:'application/pdf',get:0,type:'extra'
        });
        visual.links.push({
            source:0,target:11
        });
        visual.draw();
    }
};

