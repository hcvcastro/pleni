'use strict';

var w=960,
    h=800;

var vis=d3.select('#canvas')
    .append('svg:svg')
        .attr('width',w)
        .attr('height',h)
        .attr('pointer-events','all')
            .call(d3.behavior.zoom().on('zoom',function(){
                vis.attr('transform',
                    'translate('+d3.event.translate+')'+
                    'scale('+d3.event.scale+')');
            }))
    .append('svg:g');

var draw=function(nodes,links){
    var force=d3.layout.force()
        .size([w,h])
        .nodes(nodes)
        .links(links)
        .linkDistance(160)
        .linkStrength(6)
        .friction(0.35)
        .charge(-2000)
        .gravity(0.08)
        .start();

    var link=vis.selectAll('line.link')
        .data(links)
        .enter()
            .append('svg:line')

    var drag=force.drag()
        .on('dragstart',function(){
            d3.event.sourceEvent.stopPropagation();
        });

    var node=vis.selectAll('g.node')
        .data(nodes)
        .enter()
        .append('svg:g')
        .call(drag)

    node.append('svg:circle')
        .attr('r',function(d){
            switch(d.type){
                case 'root':
                    return 16;
                case 'page':
                    return 12;
                default:
                    return 8;
            }
        })
        .attr('class',function(d){
            return [
                'node'
              , d.type
              , (function(status){return 's-'+status;})(d.status)
              , (function(mime){return 'm-'+mime.replace('/','-');})(d.mime)
            ].join(' ');
        })

    node.append('text')
        .attr('x',function(d){
            switch(d.type){
                case 'root':
                    return 26;
                case 'page':
                    return 22;
                default:
                    return 15;
            }
         })
        .attr('y',function(d){
            switch(d.type){
                case 'root':
                    return 0;
                case 'page':
                    return 3;
                default:
                    return 6;
            }
        })
        .attr('class','text title')
        .text(function(d){
            return d.page;
        });

    node.append('text')
        .attr('x',35)
        .attr('y',20)
        .attr('class',['text','subtle'].join(' '))
        .text(function(d){
            return d.mime;
        });

    node.append('text')
        .attr('x',20)
        .attr('y',20)
        .attr('class',['text','subtle'].join(' '))
        .text(function(d){
            return d.get ? '✓':'✕';
        });

    force.on('tick',function(){
        link.attr('x1',function(d){return d.source.x;})
            .attr('y1',function(d){return d.source.y;})
            .attr('x2',function(d){return d.target.x;})
            .attr('y2',function(d){return d.target.y;});
        node.call(function(){
            this.attr('transform',function(d){
                return 'translate('+d.x+','+d.y+')';
            });
        });
  });
};

var nodes=[
    {page:'/',mime:'text/html',status:200,get:true,type:'root'}
  , {page:'/about.html',mime:'text/html',status:200,get:true,type:'page'}
  , {page:'/resources.html',mime:'text/html',status:200,get:true,type:'page'}
  , {page:'/workspace.html',mime:'text/html',status:200,get:true,type:'page'}
  , {page:'/login.html',mime:'text/html',status:200,get:true,type:'page'}
  , {page:'/signup.html',mime:'text/html',status:200,get:true,type:'page'}
  , {page:'/css/style.css',mime:'text/css',status:200,get:true,type:'extra'}
  , {page:'/img/foto01.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto02.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto03.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto04.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto05.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto06.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto07.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto08.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto09.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto10.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto11.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto12.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto13.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto14.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto15.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto16.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto17.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto18.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto19.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto20.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto21.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto22.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto23.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto24.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto25.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto26.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto27.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto28.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto29.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto30.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto31.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto32.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto33.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto34.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto35.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto36.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto37.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto38.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto39.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto40.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto41.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto42.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto43.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto44.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto45.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto46.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto47.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto48.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto49.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto50.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto51.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto52.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto53.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto54.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto55.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto56.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto57.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
  , {page:'/img/foto58.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto59.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
  , {page:'/img/foto60.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
];
var links=[
    {source:0,target: 1}
  , {source:0,target: 2}
  , {source:0,target: 3}
  , {source:0,target: 4}
  , {source:0,target: 5}
  , {source:1,target: 6}
  , {source:2,target: 6}
  , {source:3,target: 6}
  , {source:4,target: 6}
  , {source:5,target: 6}
  , {source:2,target: 7}
  , {source:2,target: 8}
  , {source:2,target: 9}
  , {source:2,target:10}
  , {source:2,target:11}
  , {source:2,target:12}
  , {source:2,target:13}
];

draw(nodes,links);

