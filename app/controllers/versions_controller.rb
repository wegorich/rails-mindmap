class VersionsController < ApplicationController
  def index
    @versions = Map.find(params[:map_id]).versions
    respond_to do |format|      
      format.json  { render :json => @versions }
    end
  end
  
  def show
    @map = Map.find(params[:map_id])
    @map.revert_to(params[:id])
    
    respond_to do |format|      
      format.svg  { render :inline => @map.svgdata }
      format.json  { render :json => @version }
    end
  end
end
