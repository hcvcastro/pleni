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
    
        visual.canvas=document.getElementById('canvas');

        visual.vis=d3.select('#canvas')
            .append('svg:svg')
            .attr('width','100%')
            .attr('height','100%')
            .attr('preserveAspectRatio','xMidYMid meet')
            .attr('pointer-events','all')
            .call(d3.behavior.zoom().on('zoom',function(){
                visual.vlinks.attr('transform',
                    'translate('+d3.event.translate+')'+
                    'scale('+d3.event.scale+')');
                visual.vnodes.attr('transform',
                    'translate('+d3.event.translate+')'+
                    'scale('+d3.event.scale+')');
            }))
            .call(visual.tip);

        d3.select('#canvas')
            .on('keyup',function(d){
                console.log('keypress',d);
            });

        visual.vlinks=visual.vis
            .append('svg:g')
                .attr('class','links');

        visual.vnodes=visual.vis
            .append('svg:g')
                .attr('class','nodes');

        visual.legend=d3.select('#canvas')
            .append('svg:svg')
            .attr('width','250px');

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
  , set:function(count,nodes,links){
        visual.count=count;
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

        visual.hash1={};
        visual.hash2={};
        visual.mimes=new Array();

        for(var i=0;i<nodes.length;i++){
            visual.hash1[nodes[i].page]=i;
            visual.add_hash2(nodes[i]);
        };
    }
  , add_hash2:function(node){
        if(!(node.mime in visual.hash2)){
            visual.hash2[node.mime]=1;
            visual.mimes.push(node.mime);
        }else{
            visual.hash2[node.mime]++;
        }
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
            .attr('class','link');
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
                      , (function(status){
                            return 's-'+~~(status/100);})(d.status)
                      , (function(mime){
                            return 'm-'+mime.replace('/','-');})(d.mime)
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
        visual.legend.selectAll('.legend').remove();

        var i=visual.legend.selectAll('.legend')
            .data(visual.mimes.sort())
          , j=i.enter().append('g')
            .attr('class','legend')
            .attr('transform',function(d,i){
                return 'translate(0,'+i*22+')';})

        j.append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('width',14)
            .attr('height',14)
            .attr('class',function(d){
                return 'm-'+d.replace('/','-');
            });

        j.append('text')
            .attr('x',20)
            .attr('y',11)
            .attr('width',180)
            .attr('height',14)
            .text(function(d){return d;});

        j.append("text")
            .attr('x',230)
            .attr('y',11)
            .style('text-anchor','end')
            .text(function(d){return visual.hash2[d];});

        i.exit().remove();

        visual.legend.attr('height',(visual.mimes.length*22+4)+'px');
    }
  , load:function(url){
        d3.json(url,function(data){
            visual.init();
            visual.set(data.count,data.nodes,data.links);
            visual.draw();
            visual.panel();
        });
    }
  , add:function(node,rels){
        var source
          , target

        if(node.page in visual.hash1){
            source=visual.hash1[node.page];

            if(node.mime!=visual.nodes[source]){
                visual.hash2[visual.nodes[source].mime]--;
                visual.add_hash2(node);
            }

            visual.nodes[source].page=node.page;
            visual.nodes[source].status=node.status;
            visual.nodes[source].mime=node.mime;
            visual.nodes[source].get=node.get;
            visual.nodes[source].type=node.type;

            d3.select('g.nodes>circle:nth-child('+(source+1)+')')
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
                      , (function(status){
                            return 's-'+~~(status/100);})(d.status)
                      , (function(mime){
                            return 'm-'+mime.replace('/','-');})(d.mime)
                    ].join(' ');
                });
        }else{
            source=visual.nodes.length;
            visual.nodes.push(node);
            visual.hash1[node.page]=source;
            visual.add_hash2[node];
        }

        rels.forEach(function(rel){
            if(rel in visual.hash1){
                target=visual.hash1[rel];

            }else{
                var node={
                    page:rel
                  , status:'unknown'
                  , mime:'unknown'
                  , get:false
                  , type:'unknown'
                };

                target=visual.nodes.length;
                visual.nodes.push(node);
                visual.hash1[rel]=target;
                visual.add_hash2(node);
            }

            visual.links.push({source:source,target:target});
            visual.adjacency1[source+'_'+target]=true;
            visual.adjacency2[target+'_'+source]=true;
        });

        visual.draw();
        visual.panel();
    }
};

