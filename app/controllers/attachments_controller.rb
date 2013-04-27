class AttachmentsController < ApplicationController
  def before_filter
    @container_class = 'container-fluid'
  end

  def create
    @attachment = Attachment.new(params[:attachment])
    @attachment.map_id = params[:map_id]
    @title = params[:title]
    respond_to do |format|
      if @attachment.save
        format.html { redirect_to(edit_map_path(@attachment.map), :notice => 'Attachment was successfully created.') }
        format.json  { render :json => @attachment, :status => :created, :location => edit_map_path(@attachment.map)}
      else
        format.html { render :action => "new" }
        format.json  { render :json => @attachment.errors, :status => :unprocessable_entity }
      end
    end
  end

  def new
    @attachment = Attachment.new(:map_id => params[:map_id])
    @map = Map.find(params[:map_id])
    @node_uuid = params[:node_id]
    respond_to do |format|
       format.html # new.html.erb
       format.json  { render :json => @attachment }
     end
  end
  
  def update
    @attachment = Attachment.find(params[:id])
    respond_to do |format|
      if @attachment.update_attributes(params[:attachment])
        format.html { redirect_to edit_map_path(@attachment.map), notice: 'Attachment was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @attachment.errors, status: :unprocessable_entity }
      end
    end
  end


  def destroy
  end

  def edit
    @map = Map.find(params[:map_id])
    @node_uuid = params[:node_id]
    @title = params[:title]
    @attachment = Attachment.find(params[:id])
  end

  def index
    @maps = current_user.maps
    respond_to do |format|
      format.html # index.html.erb
      format.json  { render :json => @maps }
    end
  end

  def show
  end
end
