class MapsController < ApplicationController
  before_filter :authenticate_user!, :except => [:public, :show, :index]
  layout :resolve_layout

  require 'base64'
  # GET /maps
  # GET /maps.xml
  def index
    unless current_user
      @maps = Map.public
      render :action => "public"
      return
    end
    @maps = current_user.maps
    @shared_maps = current_user.shared_maps
    respond_to do |format|
      format.html # index.html.erb
      format.json  { render :json => @maps }  
    end
  end

  def event
    if 'user-connected' == params[:event]
      push = $redis.lrange "map#{params[:id]}", 0, -1
    else
      $redis.rpush "map#{params[:id]}", {:event => params[:event], :data => params[:data]}.to_json
      push = Pusher["map-#{params[:id]}"].trigger(params[:event], params[:data])
    end

    respond_to do |format|
      format.json { render :json => {:status => push} }
    end
  end

  def import
    if request.post?
      uploaded_io = params[:freemind_file]      
      @map = Map.from_freemind(uploaded_io.read)
      @map.user = current_user      
      respond_to do |format|
        if @map.save
          format.html { redirect_to(edit_map_path(@map), :notice => 'Map was successfully created.') }          
        else
          format.html
        end
      end    
    end
  end
  
  def public
     @maps = Map.public
     respond_to do |format|
       format.html # index.html.erb
       format.json  { render :json => @maps }
     end     
  end
  
  def shared
     @maps = Map.public
     respond_to do |format|
       format.html # index.html.erb
       format.json  { render :json => @maps }
     end     
  end
  
  # GET /maps/1
  # GET /maps/1.json
  # GET /maps/1.svg
  def show
    @container_class = 'container-fluid'
    @map = Map.find(params[:id], :include => [:attachments, :users])
    unless @map.isPublic || (current_user && @map.user == current_user || @map.users.include?(current_user))
      return render :file => "public/401.html", :status => :unauthorized      
    end
    @readOnly  = true
    respond_to do |format|
      format.html # show.html.erb
      format.svg  do
        if @map.svgdata
          render :inline => @map.svgdata 
        else
          render :inline => '<svg />'
        end
      end
      format.json { render :json => @map.to_json(:include => [:attachments, :users]) }      
    end
  end

  def share
    @map = Map.find(params[:id])
    if request.post?
      @map.skip_version do
        @map.update_attribute(:isPublic, params[:public] == 'true')
        @saved = @map.save        
      end
      respond_to do |format|
        format.json { render :json => {:public => @map.isPublic, :status => @saved } }
      end
    else
      respond_to do |format|
        format.json { render :json => @map.isPublic }
      end
    end    
  end

  # GET /maps/new
  # GET /maps/new.json
  def new
    @map = Map.new
    @container_class = 'container-fluid'
    respond_to do |format|
      format.html # new.html.erb
      format.json  { render :json => @map }
    end
  end

  # GET /maps/1/edit
  def edit    
    @container_class = 'container-fluid'
    @map = Map.find(params[:id])    
  end

  # POST /maps
  # POST /maps.json
  def create
    unless ['dialoguemap', 'mindmap'].include?(params[:map][:conf])
      redirect_to :action => :new, :notice => 'There is a problem with the new map'
    end

    
    @map = Map.new(params[:map])
    case params[:map][:conf]
      when 'dialoguemap' then @map.content = '{"nodes":[{"position":{"x":50,"y":324},"size":{"w":100,"h":60},"text":"New map","radius":10,"style":"OpenMindMap.node.ibis.question","isroot":true}],"connections":{},"images":[]}'
      when 'mindmap' then @map.content = '{"nodes":[{"position":{"x":4000,"y":3000},"size":{"w":100,"h":60},"text":"New map","radius":10,"style":"OpenMindMap.node.classic","isroot":true}],"connections":{},"images":[]}'
    end
    @map.user = current_user
    
    respond_to do |format|
      if @map.save
        format.html { redirect_to(edit_map_url(@map), :notice => 'Map was successfully created.') }
        format.json  { render :json => @map, :status => :created, :location => @map }
      else
        format.html { render :action => "new" }
        format.json  { render :json => @map.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /maps/1
  # PUT /maps/1.json
  def update
    @map = Map.find(params[:id])
    if params[:map][:users] && params[:map][:users][:user_email]
      @user = User.find_by_email(params[:map][:users][:user_email])
      if @user
        @map.users << @user
      end
      params[:map].delete(:users)
    end
    params[:map][:last_edit_by] = current_user.id
    if params[:versioning]
      map_saved = @map.update_attributes(params[:map])
    else
      @map.skip_version do
        map_saved = @map.update_attributes(params[:map])
      end
    end
    respond_to do |format|
      if map_saved
        if params[:map][:content]
          $redis.del "map#{params[:id]}"
        end
        format.html { redirect_to(@map, :notice => 'Map was successfully updated.') }
        format.json  { render :json => @map.to_json({:methods => [:version]}), :status => :ok }
        format.js 
      else
        format.html { render :action => "edit" }
        format.json { render :json => @map.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /maps/1
  # DELETE /maps/1.xml
  def destroy
    @map = Map.find(params[:id])
    @map.destroy if (@map.user == current_user)
    respond_to do |format|
      format.html { redirect_to(maps_url) }
      format.json  { head :ok }
    end
  end

private

  def resolve_layout
    case action_name
    when "edit"
      "maps_editor"
    else
      "application"
    end
  end

end