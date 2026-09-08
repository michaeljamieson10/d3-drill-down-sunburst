const arc=d3.arc().innerRadius(0).outerRadius(160)
 .startAngle(0).endAngle(Math.PI/2);
const paths=svg.append("path").attr("d",arc);
arc.innerRadius(70);
paths.attr("d",arc).attr("fill","#14b8a6");
const rows=[["root","",0],["Web","root",0],
["HTML","Web",8],["CSS","Web",6],
["Data","root",0],["D3","Data",10]];
const root=d3.stratify().id(d=>d[0])
 .parentId(d=>d[1])(rows).sum(d=>d[2]);
const layout=d3.partition()
 .size([2*Math.PI,root.height+1])(root);
arc.startAngle(d=>d.x0).endAngle(d=>d.x1);
svg.selectAll("path").data(layout.children)
 .join("path").attr("d",arc).attr("fill","#14b8a6")
 .attr("stroke","#fff");
arc.innerRadius(d=>d.y0*70)
 .outerRadius(d=>d.y1*70-1)
 .padAngle(.01).padRadius(200);
svg.selectAll("path")
 .data(layout.descendants().slice(1)).join("path")
 .attr("d",arc).attr("stroke","#fff")
 .attr("fill",d=>d.depth==1?"#14b8a6":"#f59e0b");
let focus=root;
const centre=svg.append("circle")
 .attr("r",70).attr("fill","#fafbfc");
const clamp=x=>Math.max(0,Math.min(1,x));
const angle=(x,p)=>
 clamp((x-p.x0)/(p.x1-p.x0))*2*Math.PI;
const target=(d,p)=>({
 x0:angle(d.x0,p), x1:angle(d.x1,p),
 y0:Math.max(0,d.y0-p.depth),
 y1:Math.max(0,d.y1-p.depth)});
root.each(d=>d.current=d);
function zoom(p) {
 focus=p;
 root.each(d=>d.target=target(d,p));
 const t=svg.transition().duration(750);
 svg.selectAll("path").transition(t)
 .tween("data",d=>{
  const i=d3.interpolate(d.current,d.target);
  return t=>d.current=i(t);})
 .attr("opacity",d=>d.target.y0>=1?1:0)
 .attrTween("d",d=>()=>arc(d.current));
}
svg.selectAll("path").attr("opacity",1)
 .filter(d=>d.children).on("click",(e,d)=>zoom(d));
centre.on("click",()=>zoom(focus.parent||root));
