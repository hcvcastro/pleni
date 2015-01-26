'use strict';

var w=960
  , h=800
  , svg=d3.select('svg.canvas')
          .attr('width',w)
          .attr('height',h)
  , nodes=[
        {page:'/',mime:'text/html',status:200,get:true,type:'root'}
      , {page:'/about.html',mime:'text/html',status:200,get:true,type:'page'}
      , {page:'/resources.html',mime:'text/html',status:200,get:true,type:'page'}
      , {page:'/workspace.html',mime:'text/html',status:200,get:true,type:'page'}
      , {page:'/login.html',mime:'text/html',status:200,get:true,type:'page'}
      , {page:'/signup.html',mime:'text/html',status:200,get:true,type:'page'}
      , {page:'/css/style.css',mime:'text/css',status:200,get:true,type:'extra'}
      , {page:'/img/foto1.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
      , {page:'/img/foto2.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
      , {page:'/img/foto3.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
      , {page:'/img/foto4.jpg',mime:'image/jpeg',status:200,get:false,type:'extra'}
      , {page:'/img/foto5.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
      , {page:'/img/foto6.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
      , {page:'/img/foto7.jpg',mime:'image/jpeg',status:404,get:false,type:'extra'}
    ]
  , links=[
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
    ]
  , force=d3.layout.force()
        .size([w,h])
        .nodes(nodes)
        .links(links)
        .linkDistance(160)
        .linkStrength(6)
        .friction(0.35)
        .charge(-2000)
        .gravity(0.08)
        .start()
  , link=svg.selectAll('line.link')
        .data(links)
        .enter()
        .append('line')
  , node=svg.selectAll('g.node')
        .data(force.nodes())
        .enter()
        .append('svg:g')

node.append('circle')
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
    });
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

node.call(force.drag);

force.on('tick',function(){
    node.call(function(){
        this.attr('transform',function(d){
            return 'translate('+d.x+','+d.y+')';
        });
    });
    link.call(function(){
        this.attr('x1',function(d){
            return d.source.x;
        }).attr('y1',function(d){
            return d.source.y;
        }).attr('x2',function(d){
            return d.target.x;
        }).attr('y2',function(d){
            return d.target.y;
        });
    });
});

