package model.dto;

public class MetricsDTO {

	public Long postId;
	public Integer rate;
	public boolean saved;
	public boolean reposted;

	public MetricsDTO(Long postId, Integer rate, boolean saved, boolean reposted) {
		this.postId = postId;
		this.rate = rate;
		this.saved = saved;
		this.reposted = reposted;
	}

}
