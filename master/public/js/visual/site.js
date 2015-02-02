'use strict';

if(!visual){
    var visual={};
}

visual.site={
    init:function(){
        visual.site.tip=d3.tip()
            .attr('class','tooltip')
            .html(function(d){
                return '<div class="title">'+d.page+'</div>'+
                    '<div class="subtle">'+(d.get ? '✓':'✕')+'</div>'+
                    '<div class="subtle">'+d.mime+'</div>';
            })
            .direction('n');
        visual.site.zoom=d3.behavior.zoom().on('zoom',function(){
                visual.site.vis.attr('transform',
                    'translate('+d3.event.translate+')'+
                    'scale('+d3.event.scale+')');
            });
    
        visual.site.canvas=document.getElementById('canvas');

        visual.site.vis=d3.select('#canvas')
            .append('svg:svg')
            .attr('width','100%')
            .attr('height','100%')
            .attr('pointer-events','all')
            .call(visual.site.zoom)
            .append('svg:g')
            .call(visual.site.tip);

        visual.site.legend=d3.select('#canvas')
            .append('svg:svg')
            .attr('width','250px')
            .append('svg:g')
    }
  , draw:function(nodes,links){
        this.nodes=nodes;
        this.links=links;

        nodes[0].x=~~(visual.site.canvas.clientWidth/2)-9;
        nodes[0].y=~~(visual.site.canvas.clientHeight/2)-9;
        nodes[0].fixed=true;

        visual.site.force=d3.layout.force()
            .size([
                visual.site.canvas.clientWidth,
                visual.site.canvas.clientHeight])
            .nodes(nodes)
            .links(links)
            .linkDistance(200)
            .linkStrength(1)
            .friction(0.5)
            .charge(-2000)
            .gravity(0.1)
            .start();

        var adjacency1={}
          , adjacency2={}
          , linked=function(e,r){
                return (e.index+'_'+r.index) in adjacency1;
            }
          , linkin=function(e,r){
                return (e.index+'_'+r.index) in adjacency2;
            }

        links.forEach(function(d){
            adjacency1[d.source.index+'_'+d.target.index]=true;
            adjacency2[d.target.index+'_'+d.source.index]=true;
        });

        var link=visual.site.vis.selectAll('line.link')
            .data(links)
            .enter()
                .append('svg:line');

        var drag=visual.site.force.drag()
            .on('dragstart',function(d){
                d3.event.sourceEvent.stopPropagation();
                d3.select(this).classed('fixed',d.fixed=true);
            });

        var node=visual.site.vis.selectAll('g.node')
            .data(nodes)
            .enter()
            .append('svg:g')
            .call(drag);

        node.append('svg:circle')
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
                visual.site.tip.show(e);
                node.style('opacity',function(r){
                    if(e.index==r.index){return 1;}
                    return linked(e,r) || linkin(e,r) ? 1:0.25;
                });
                link.classed('highlighted',function(r){
                    return r.source.index==e.index||
                           r.target.index==e.index ? true:false;
                });
            })
            .on('mouseout',function(e){
                visual.site.tip.hide(e);
                node.style('opacity',1);
                link.classed('highlighted',false);
            })

        visual.site.force.on('tick',function(){
            link.attr('x1',function(d){
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
            node.attr('cx',function(d){
                    return d.x;
                })
                .attr('cy',function(d){
                    return d.y;
                });
            node.call(function(){
                this.attr('transform',function(d){
                    return 'translate('+d.x+','+d.y+')';
                });
            });
        });
    }
  , panel:function(){
        var dict={}
          , mimes=new Array()

        this.nodes.forEach(function(n){
            if(!(n.mime in dict)){
                dict[n.mime]=1;
                mimes.push(n.mime);
            }else{
                dict[n.mime]++;
            }
        });

        var legend=visual.site.legend.selectAll('.legend')
            .data(mimes.sort())
            .enter().append('g')
            .attr('class','legend')
            .attr('transform',function(d,i){
                return 'translate(0,'+i*22+')';});

        legend.append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('width',14)
            .attr('height',14)
            .attr('class',function(d){
                return 'm-'+d.replace('/','-');
            });

        legend.append('text')
            .attr('x',20)
            .attr('y',11)
            .attr('width',180)
            .attr('height',14)
            .text(function(d){return d;});

        legend.append("text")
            .attr('x',230)
            .attr('y',11)
            .style('text-anchor','end')
            .text(function(d){return dict[d];});
    }
  , load:function(url){
        d3.json(url,function(data){
            visual.site.init();
            visual.site.draw(data.nodes,data.links);
            visual.site.panel();
        });
    }
};

